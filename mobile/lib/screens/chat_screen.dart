import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:http/http.dart' as http;
import 'package:just_audio/just_audio.dart';
import 'package:path_provider/path_provider.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../models/chat_message.dart';
import '../models/user.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/voice_recorder.dart';
import '../widgets/file_upload_button.dart';
import 'profile_screen.dart';
import 'notifications_screen.dart';

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  final _audioPlayer = AudioPlayer();

  List<ChatMessage> _messages = [];
  List<String> _suggestions = [];
  UserModel? _user;
  bool _isLoading = false;
  File? _pendingFile;
  String? _pendingFileName;
  int _notifCount = 0;

  @override
  void initState() {
    super.initState();
    _initUser();
    _loadSuggestions();
    _addWelcomeMessage();
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  Future<void> _initUser() async {
    final userData = await AuthService.getUser();
    if (userData != null && mounted) {
      setState(() => _user = UserModel.fromJson(userData));
    }
  }

  Future<void> _loadSuggestions() async {
    try {
      final headers = await AuthService.authHeaders();
      final resp = await ApiConstants.wrap(() => http.get(Uri.parse(ApiConstants.chatSuggestions), headers: headers).timeout(const Duration(seconds: 15)));
      if (resp.statusCode == 200 && mounted) {
        final data = jsonDecode(resp.body) as Map<String, dynamic>;
        setState(() {
          _suggestions = (data['suggestions'] as List<dynamic>?)
                  ?.map((e) => e.toString())
                  .toList() ??
              [];
          _notifCount = _suggestions.isNotEmpty ? 1 : 0;
        });
      }
    } catch (_) {}
  }

  void _addWelcomeMessage() {
    final welcome = ChatMessage(
      id: 'welcome',
      role: 'bot',
      text: '',
      response: ChatResponse(
        id: 'welcome',
        type: 'text',
        title: null,
        content: {
          'markdown':
              '👋 **Welcome to Stash AI!**\n\nI\'m your intelligent godown assistant. Ask me anything about:\n- 📦 Inventory & stock levels\n- 🛒 Orders & billing\n- 📊 Revenue & analytics\n- 🔄 Restock suggestions\n\n*Tip: Hold the 🎤 mic button to speak your query!*',
        },
        voiceReply: 'Welcome to Stash AI! How can I help you today?',
        createdAt: DateTime.now(),
      ),
      createdAt: DateTime.now(),
    );
    setState(() => _messages = [welcome]);
  }

  // ─── Send Message ─────────────────────────────────────────────────────────

  Future<void> _sendMessage(String text, {bool isVoice = false}) async {
    if (text.trim().isEmpty && _pendingFile == null) return;

    final userMsg = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      role: 'user',
      text: text.trim().isNotEmpty ? text.trim() : (_pendingFileName ?? 'Attached file'),
      isVoice: isVoice,
      isFile: _pendingFile != null,
      fileName: _pendingFileName,
      createdAt: DateTime.now(),
    );

    setState(() {
      _messages.add(userMsg);
      _isLoading = true;
      _suggestions = [];
    });
    _textController.clear();
    _scrollToBottom();

    final file = _pendingFile;
    _pendingFile = null;
    _pendingFileName = null;

    try {
      final historyJson = _messages
          .where((m) => m.id != 'welcome' && !m.isUser || m.isUser)
          .take(10)
          .map((m) => {'role': m.isUser ? 'user' : 'assistant', 'content': m.text})
          .toList();

      ChatResponse? response;

      if (file != null) {
        response = await _sendMultimodal(text, historyJson, file);
      } else {
        response = await _sendTextChat(text, historyJson);
      }

      if (response != null && mounted) {
        String botText = response.voiceReply;
        if (response.type == 'text' && response.content is Map) {
          botText = (response.content as Map)['markdown']?.toString() ?? response.voiceReply;
        }
        final botMsg = ChatMessage(
          id: response.id,
          role: 'bot',
          text: botText,
          response: response,
          createdAt: response.createdAt,
        );
        setState(() { _messages.add(botMsg); _isLoading = false; });
        _scrollToBottom();

        // TTS for voice queries
        if (isVoice && response.voiceReply.isNotEmpty) {
          await _speak(response.voiceReply);
        }
      }
    } catch (e) {
      if (mounted) {
        // Fallback to simulated offline response generator
        final response = _generateSimulatedResponse(text);
        String botText = response.voiceReply;
        if (response.type == 'text' && response.content is Map) {
          botText = (response.content as Map)['markdown']?.toString() ?? response.voiceReply;
        }
        final botMsg = ChatMessage(
          id: response.id,
          role: 'bot',
          text: botText,
          response: response,
          createdAt: response.createdAt,
        );
        setState(() {
          _messages.add(botMsg);
          _isLoading = false;
        });
        _scrollToBottom();
        _showSnack('Offline mode active — simulated response loaded.');
      }
    }
  }

  Future<ChatResponse?> _sendTextChat(
    String query,
    List<Map<String, dynamic>> history,
  ) async {
    final headers = await AuthService.authHeaders();
    final resp = await ApiConstants.wrap(() => http.post(
      Uri.parse(ApiConstants.chat),
      headers: headers,
      body: jsonEncode({'query': query, 'history': history}),
    ).timeout(const Duration(seconds: 15)));

    if (resp.statusCode == 200) {
      return ChatResponse.fromJson(jsonDecode(resp.body) as Map<String, dynamic>);
    }
    throw Exception('Chat request failed: ${resp.statusCode}');
  }

  Future<ChatResponse?> _sendMultimodal(
    String query,
    List<Map<String, dynamic>> history,
    File file,
  ) async {
    final token = await AuthService.getToken();
    final resp = await ApiConstants.wrap(() async {
      final request = http.MultipartRequest(
        'POST',
        Uri.parse(ApiConstants.chatMultimodal),
      );
      if (token != null) request.headers['Authorization'] = 'Bearer $token';
      request.fields['query'] = query.isNotEmpty ? query : 'Analyze this file';
      request.fields['history'] = jsonEncode(history);
      request.files.add(await http.MultipartFile.fromPath('file', file.path));

      final streamed = await request.send().timeout(const Duration(seconds: 30));
      return http.Response.fromStream(streamed);
    });
    final body = resp.body;
    if (resp.statusCode == 200) {
      return ChatResponse.fromJson(jsonDecode(body) as Map<String, dynamic>);
    }
    throw Exception('Multimodal request failed: ${resp.statusCode}');
  }

  // ─── TTS ──────────────────────────────────────────────────────────────────

  Future<void> _speak(String text) async {
    try {
      final headers = await AuthService.authHeaders();
      headers['Content-Type'] = 'application/json';
      final resp = await ApiConstants.wrap(() => http.post(
        Uri.parse(ApiConstants.tts),
        headers: headers,
        body: jsonEncode({'text': text, 'source': 'mobile_admin', 'role': 'admin'}),
      ).timeout(const Duration(seconds: 15)));

      if (resp.statusCode == 200 && resp.bodyBytes.isNotEmpty) {
        final dir = await getTemporaryDirectory();
        final ttsFile = File('${dir.path}/stash_tts_${DateTime.now().millisecondsSinceEpoch}.mp3');
        await ttsFile.writeAsBytes(resp.bodyBytes);
        await _audioPlayer.setFilePath(ttsFile.path);
        await _audioPlayer.play();
      }
    } catch (e) {
      // TTS is best-effort — don't show error to user
    }
  }

  // ─── UI Helpers ───────────────────────────────────────────────────────────

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _showSnack(String message, {bool isError = false}) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: GoogleFonts.googleSans(fontSize: 13)),
        backgroundColor: isError ? StashColors.error : StashColors.brand700,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        margin: const EdgeInsets.all(12),
      ),
    );
  }

  void _onFileSelected(File file, String name) {
    setState(() { _pendingFile = file; _pendingFileName = name; });
    _showSnack('📎 $name ready to send');
  }

  // ─── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StashColors.surface,
      appBar: _buildAppBar(),
      body: Column(
        children: [
          Expanded(child: _buildMessageList()),
          if (_suggestions.isNotEmpty) _buildSuggestions(),
          if (_pendingFile != null) _buildFilePreview(),
          _buildInputBar(),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: StashColors.surface,
      elevation: 0,
      scrolledUnderElevation: 0,
      title: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Stash AI',
            style: GoogleFonts.googleSans(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: StashColors.brand800,
            ),
          ),
          const SizedBox(width: 4),
          const Icon(Icons.keyboard_arrow_down_rounded, size: 20, color: StashColors.textMuted),
        ],
      ),
      centerTitle: true,
      actions: [
        // Notifications bell
        Stack(
          children: [
            IconButton(
              onPressed: () => Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const NotificationsScreen()),
              ),
              icon: const Icon(Icons.notifications_outlined, color: StashColors.brand800),
              tooltip: 'Notifications',
            ),
            if (_notifCount > 0)
              Positioned(
                right: 10,
                top: 10,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: StashColors.error,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),

        // Profile avatar
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ProfileScreen()),
            ),
            child: CircleAvatar(
              radius: 16,
              backgroundColor: StashColors.brand200,
              child: Text(
                _user?.initials ?? 'A',
                style: GoogleFonts.googleSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: StashColors.brand800,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildMessageList() {
    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.symmetric(vertical: 12),
      itemCount: _messages.length + (_isLoading ? 1 : 0),
      itemBuilder: (context, index) {
        if (_isLoading && index == _messages.length) {
          return const TypingIndicator();
        }
        return ChatBubble(message: _messages[index]);
      },
    );
  }

  Widget _buildSuggestions() {
    return Container(
      height: 36,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 16),
        itemCount: _suggestions.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          return Material(
            color: StashColors.surface,
            child: InkWell(
              onTap: () => _sendMessage(_suggestions[index]),
              borderRadius: BorderRadius.circular(18),
              child: Ink(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: StashColors.bgAlt,
                  borderRadius: BorderRadius.circular(18),
                  border: Border.all(color: StashColors.divider, width: 1),
                ),
                child: Center(
                  child: Text(
                    _suggestions[index],
                    style: GoogleFonts.googleSans(
                      fontSize: 13,
                      color: StashColors.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildFilePreview() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: StashColors.bgAlt,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          const Icon(Icons.description_rounded, size: 16, color: StashColors.brand800),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              _pendingFileName ?? 'File attached',
              style: GoogleFonts.googleSans(fontSize: 13, color: StashColors.textPrimary, fontWeight: FontWeight.w500),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          GestureDetector(
            onTap: () => setState(() { _pendingFile = null; _pendingFileName = null; }),
            child: const Icon(Icons.close, size: 16, color: StashColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _buildInputBar() {
    return Container(
      margin: const EdgeInsets.only(left: 12, right: 12, top: 4, bottom: 20),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: FileUploadButton(onFileSelected: _onFileSelected),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Container(
              decoration: BoxDecoration(
                color: StashColors.brand100,
                borderRadius: BorderRadius.circular(24),
              ),
              child: TextField(
                controller: _textController,
                maxLines: 5,
                minLines: 1,
                textInputAction: TextInputAction.newline,
                keyboardType: TextInputType.multiline,
                style: GoogleFonts.googleSans(fontSize: 16, color: StashColors.textPrimary),
                decoration: InputDecoration(
                  hintText: 'Message Stash AI...',
                  hintStyle: GoogleFonts.googleSans(fontSize: 15, color: StashColors.textMuted),
                  filled: false,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  disabledBorder: InputBorder.none,
                  errorBorder: InputBorder.none,
                  focusedErrorBorder: InputBorder.none,
                ),
                onSubmitted: (text) => _sendMessage(text),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(bottom: 2),
            child: VoiceRecorderButton(
              onTranscript: (transcript) {
                setState(() => _textController.text = transcript);
                _sendMessage(transcript, isVoice: true);
              },
              onError: (err) => _showSnack(err, isError: true),
            ),
          ),
          const SizedBox(width: 8),
          Padding(
            padding: const EdgeInsets.only(bottom: 4),
            child: ValueListenableBuilder<TextEditingValue>(
              valueListenable: _textController,
              builder: (context, value, child) {
                final hasText = value.text.trim().isNotEmpty || _pendingFile != null;
                return InkWell(
                  onTap: () => _sendMessage(_textController.text),
                  borderRadius: BorderRadius.circular(22),
                  child: Ink(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: hasText ? StashColors.brand600 : StashColors.divider,
                      shape: BoxShape.circle,
                    ),
                    child: _isLoading
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                          )
                        : Icon(Icons.arrow_upward_rounded, color: hasText ? Colors.white : StashColors.textMuted, size: 20),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  ChatResponse _generateSimulatedResponse(String query) {
    final lower = query.toLowerCase();
    final id = DateTime.now().millisecondsSinceEpoch.toString();
    final now = DateTime.now();

    if (lower.contains('stock') || lower.contains('inventory') || lower.contains('items')) {
      return ChatResponse(
        id: id,
        type: 'table',
        title: 'Current Inventory Status',
        createdAt: now,
        voiceReply: 'Here is the current inventory list from your warehouse.',
        content: {
          'headers': ['Item', 'Stock', 'Threshold', 'Status'],
          'rows': [
            ['Basmati Rice', '15 kg', '50 kg', 'Low Stock'],
            ['Wheat Flour', '120 kg', '80 kg', 'Optimal'],
            ['Sugar Sacks', '200 kg', '100 kg', 'Optimal'],
            ['Refined Oil', '5 L', '30 L', 'Critical'],
          ],
        },
      );
    } else if (lower.contains('chart') || lower.contains('graph') || lower.contains('stats') || lower.contains('trend')) {
      return ChatResponse(
        id: id,
        type: 'chart',
        title: 'Weekly Restock Trends',
        createdAt: now,
        voiceReply: 'Here is the graph showing restock levels over the last 7 days.',
        content: {
          'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          'values': [30.0, 45.0, 35.0, 60.0, 75.0, 50.0, 90.0],
        },
      );
    } else if (lower.contains('approve') || lower.contains('restock') || lower.contains('eoq') || lower.contains('order')) {
      return ChatResponse(
        id: id,
        type: 'approval',
        title: 'Pending Purchase Approvals',
        createdAt: now,
        voiceReply: 'Here are the pending EOQ purchase orders that require your approval.',
        content: {
          'items': [
            {
              'id': 'PO-8092',
              'name': 'Basmati Rice (Premium)',
              'qty': 35,
              'unit': 'kg',
              'cost': 4500,
              'status': 'pending',
            },
            {
              'id': 'PO-8093',
              'name': 'Refined Sunflower Oil',
              'qty': 25,
              'unit': 'L',
              'cost': 3750,
              'status': 'pending',
            }
          ]
        },
      );
    } else if (lower.contains('alert') || lower.contains('notification') || lower.contains('warn')) {
      return ChatResponse(
        id: id,
        type: 'list',
        title: 'Active Alerts',
        createdAt: now,
        voiceReply: 'You have two critical alerts requiring attention.',
        content: {
          'items': [
            {
              'label': 'Low Stock Alert',
              'value': '15 kg left',
              'badge': 'error',
              'subtitle': 'Basmati Rice is below the threshold of 50 kg.',
            },
            {
              'label': 'Pending Payment',
              'value': '₹4,500',
              'badge': 'warn',
              'subtitle': 'Invoice INV-9201 is overdue by 3 days.',
            }
          ]
        },
      );
    } else {
      return ChatResponse(
        id: id,
        type: 'text',
        createdAt: now,
        voiceReply: 'Welcome to Stash AI. How can I assist you with your warehouse today?',
        content: {
          'markdown': 'Hello! I am **Stash AI**, your automated warehouse manager. I can help you monitor inventory, track restock parameters (like EOQ), and manage operations.\n\nTry asking me for:\n- `Show stock list` (renders an inventory table)\n- `Show restock trends` (renders a line graph)\n- `View pending approvals` (renders actionable purchase cards)\n- `Check active alerts` (renders warehouse warnings)',
        },
      );
    }
  }
}
