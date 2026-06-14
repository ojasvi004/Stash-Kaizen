import 'package:flutter/material.dart';
import 'package:flutter_markdown/flutter_markdown.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants.dart';
import '../models/chat_message.dart';
import 'generative_ui/list_widget.dart';
import 'generative_ui/table_widget.dart';
import 'generative_ui/chart_widget.dart';
import 'generative_ui/card_widget.dart';
import 'generative_ui/approval_widget.dart';

/// The main chat bubble — renders both user and bot messages.
class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({super.key, required this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
      child: message.isUser ? _UserBubble(message: message) : _BotBubble(message: message),
    );
  }
}

// ─── User Bubble ────────────────────────────────────────────────────────────

class _UserBubble extends StatelessWidget {
  final ChatMessage message;
  const _UserBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.end,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Flexible(
          child: Container(
            constraints: BoxConstraints(
              maxWidth: MediaQuery.of(context).size.width * 0.85,
            ),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: StashColors.brand600,
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(20),
                topRight: Radius.circular(20),
                bottomLeft: Radius.circular(20),
                bottomRight: Radius.circular(4),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                if (message.isVoice)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.mic, color: Colors.white, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        'Voice',
                        style: GoogleFonts.googleSans(fontSize: 11, color: Colors.white.withValues(alpha: 0.8)),
                      ),
                    ],
                  ),
                if (message.isFile && message.fileName != null)
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.attach_file, color: Colors.white, size: 14),
                      const SizedBox(width: 4),
                      Flexible(
                        child: Text(
                          message.fileName!,
                          style: GoogleFonts.googleSans(fontSize: 11, color: Colors.white.withValues(alpha: 0.8)),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                if (message.isVoice || (message.isFile && message.fileName != null))
                  const SizedBox(height: 4),
                Text(
                  message.text,
                  style: GoogleFonts.googleSans(
                    fontSize: 16,
                    color: Colors.white,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _formatTime(message.createdAt),
                  style: GoogleFonts.googleSans(fontSize: 10, color: Colors.white.withValues(alpha: 0.7)),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Bot Bubble ─────────────────────────────────────────────────────────────

class _BotBubble extends StatelessWidget {
  final ChatMessage message;
  const _BotBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final resp = message.response;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Stash AI Sparkle Avatar
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [StashColors.brand700, StashColors.brand600],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: StashColors.brand600.withValues(alpha: 0.2),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: const Icon(Icons.auto_awesome, color: Colors.white, size: 16),
        ),
        const SizedBox(width: 12),
        Flexible(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.only(top: 2, bottom: 6),
                child: Text(
                  'Stash AI',
                  style: GoogleFonts.googleSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: StashColors.brand800,
                  ),
                ),
              ),
              resp != null
                  ? _renderGenerativeContent(resp)
                  : Text(
                      message.text,
                      style: GoogleFonts.googleSans(
                          fontSize: 15,
                          color: StashColors.textPrimary,
                          height: 1.5,
                          fontWeight: FontWeight.w400),
                    ),
              const SizedBox(height: 6),
              Text(
                _formatTime(message.createdAt),
                style: GoogleFonts.googleSans(fontSize: 10, color: StashColors.textMuted),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _renderGenerativeContent(ChatResponse resp) {
    Widget child;
    bool requiresCard = true;
    switch (resp.type) {
      case 'list':
        child = ListWidget(content: resp.content as Map<String, dynamic>? ?? {}, title: resp.title);
        break;
      case 'table':
        child = TableWidget(content: resp.content as Map<String, dynamic>? ?? {}, title: resp.title);
        break;
      case 'chart':
        child = ChartWidget(content: resp.content as Map<String, dynamic>? ?? {}, title: resp.title);
        break;
      case 'card':
        child = CardWidget(content: resp.content as Map<String, dynamic>? ?? {}, title: resp.title);
        break;
      case 'approval':
        child = ApprovalWidget(content: resp.content as Map<String, dynamic>? ?? {}, title: resp.title);
        break;
      case 'mixed':
        requiresCard = false;
        final sections = (resp.content['sections'] as List<dynamic>?) ?? [];
        child = Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: sections.map((s) {
            final sec = s as Map<String, dynamic>;
            final secType = sec['type'] as String? ?? 'text';
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: _renderSection(secType, sec, null),
            );
          }).toList(),
        );
        break;
      case 'text':
      default:
        requiresCard = false;
        final markdown = (resp.content as Map<String, dynamic>?)?['markdown'] as String? ?? '';
        child = _buildMarkdown(markdown.isNotEmpty ? markdown : resp.content?.toString() ?? '');
        break;
    }

    if (!requiresCard) {
      return Padding(
        padding: const EdgeInsets.only(top: 4, bottom: 4),
        child: child,
      );
    }

    // Unified card styling for generative components
    return Container(
      margin: const EdgeInsets.only(top: 6, bottom: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: StashColors.bgAlt,
        borderRadius: BorderRadius.circular(16),
      ),
      child: child,
    );
  }

  Widget _renderSection(String type, Map<String, dynamic> content, String? title) {
    switch (type) {
      case 'list': return ListWidget(content: content, title: title);
      case 'table': return TableWidget(content: content, title: title);
      case 'chart': return ChartWidget(content: content, title: title);
      case 'card': return CardWidget(content: content, title: title);
      case 'approval': return ApprovalWidget(content: content, title: title);
      default:
        final text = (content['markdown'] as String?) ?? content.toString();
        return _buildMarkdown(text);
    }
  }

  Widget _buildMarkdown(String data) {
    return MarkdownBody(
      data: data,
      styleSheet: MarkdownStyleSheet(
        p: GoogleFonts.googleSans(fontSize: 15, color: StashColors.textPrimary, height: 1.6, fontWeight: FontWeight.w400),
        strong: GoogleFonts.googleSans(fontWeight: FontWeight.w700, color: StashColors.brand800),
        h1: GoogleFonts.googleSans(fontSize: 18, fontWeight: FontWeight.w800, color: StashColors.brand900),
        h2: GoogleFonts.googleSans(fontSize: 16, fontWeight: FontWeight.w700, color: StashColors.brand800),
        h3: GoogleFonts.googleSans(fontSize: 15, fontWeight: FontWeight.w600, color: StashColors.brand700),
        code: GoogleFonts.sourceCodePro(fontSize: 13, backgroundColor: StashColors.bgAlt),
        codeblockPadding: const EdgeInsets.all(12),
        codeblockDecoration: BoxDecoration(
          color: StashColors.brand50,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: StashColors.divider),
        ),
        blockquote: GoogleFonts.googleSans(fontStyle: FontStyle.italic, color: StashColors.textMuted),
        blockquoteDecoration: const BoxDecoration(
          border: Border(left: BorderSide(color: StashColors.brand300, width: 4)),
        ),
      ),
    );
  }
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

class TypingIndicator extends StatefulWidget {
  const TypingIndicator({super.key});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator> with TickerProviderStateMixin {
  final List<AnimationController> _controllers = [];
  final List<Animation<double>> _animations = [];

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < 3; i++) {
      final ctrl = AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      )..repeat(reverse: true);
      _controllers.add(ctrl);
      _animations.add(
        Tween<double>(begin: 0, end: -6).animate(
          CurvedAnimation(
            parent: ctrl,
            curve: Interval(i * 0.2, 0.6 + i * 0.2, curve: Curves.easeInOut),
          ),
        ),
      );
      Future.delayed(Duration(milliseconds: i * 150), () {
        if (mounted) ctrl.repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) { c.dispose(); }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4, horizontal: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            decoration: const BoxDecoration(
              color: StashColors.brand600,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.auto_awesome, color: Colors.white, size: 16),
          ),
          const SizedBox(width: 14),
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) {
                return AnimatedBuilder(
                  animation: _animations[i],
                  builder: (_, __) => Transform.translate(
                    offset: Offset(0, _animations[i].value),
                    child: Container(
                      width: 6,
                      height: 6,
                      margin: EdgeInsets.only(right: i < 2 ? 4 : 0),
                      decoration: const BoxDecoration(
                        color: StashColors.brand400,
                        shape: BoxShape.circle,
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

String _formatTime(DateTime dt) {
  final h = dt.hour;
  final m = dt.minute.toString().padLeft(2, '0');
  final period = h >= 12 ? 'PM' : 'AM';
  final hour = h > 12 ? h - 12 : (h == 0 ? 12 : h);
  return '$hour:$m $period';
}
