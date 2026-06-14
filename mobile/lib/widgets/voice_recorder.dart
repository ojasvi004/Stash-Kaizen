import 'dart:io';
import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';
import 'package:path_provider/path_provider.dart';
import 'package:http/http.dart' as http;
import '../core/constants.dart';

typedef VoiceResultCallback = void Function(String transcript);
typedef VoiceErrorCallback = void Function(String error);

class VoiceRecorderButton extends StatefulWidget {
  final VoiceResultCallback onTranscript;
  final VoiceErrorCallback? onError;

  const VoiceRecorderButton({
    super.key,
    required this.onTranscript,
    this.onError,
  });

  @override
  State<VoiceRecorderButton> createState() => _VoiceRecorderButtonState();
}

class _VoiceRecorderButtonState extends State<VoiceRecorderButton>
    with SingleTickerProviderStateMixin {
  final AudioRecorder _recorder = AudioRecorder();
  bool _isRecording = false;
  bool _isProcessing = false;
  String? _recordingPath;

  late AnimationController _pulseCtrl;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _pulseAnim = Tween<double>(begin: 1.0, end: 1.25).animate(
      CurvedAnimation(parent: _pulseCtrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseCtrl.dispose();
    _recorder.dispose();
    super.dispose();
  }

  Future<void> _startRecording() async {
    final status = await Permission.microphone.request();
    if (!status.isGranted) {
      widget.onError?.call('Microphone permission denied.');
      return;
    }

    final dir = await getTemporaryDirectory();
    _recordingPath = '${dir.path}/stash_voice_${DateTime.now().millisecondsSinceEpoch}.m4a';

    await _recorder.start(
      const RecordConfig(encoder: AudioEncoder.aacLc, bitRate: 128000, sampleRate: 16000),
      path: _recordingPath!,
    );

    setState(() => _isRecording = true);
    _pulseCtrl.repeat(reverse: true);
  }

  Future<void> _stopRecording() async {
    _pulseCtrl.stop();
    _pulseCtrl.reset();
    await _recorder.stop();
    setState(() { _isRecording = false; _isProcessing = true; });
    await _transcribeAudio();
    setState(() => _isProcessing = false);
  }

  Future<void> _transcribeAudio() async {
    if (_recordingPath == null) return;

    final file = File(_recordingPath!);
    if (!await file.exists()) {
      widget.onError?.call('Recording file not found.');
      return;
    }

    try {
      final resp = await ApiConstants.wrap(() async {
        final request = http.MultipartRequest('POST', Uri.parse(ApiConstants.stt));
        request.files.add(await http.MultipartFile.fromPath('audio', _recordingPath!));
        request.fields['language_hint'] = 'hi-IN';
        request.fields['output_mode'] = 'hinglish';
        final streamed = await request.send().timeout(const Duration(seconds: 30));
        return http.Response.fromStream(streamed);
      });
      final body = resp.body;

      if (resp.statusCode == 200) {
        final data = jsonDecode(body) as Map<String, dynamic>;
        final transcript = (data['transcript_hinglish'] as String?)
            ?? data['transcript'] as String?
            ?? '';
        if (transcript.isNotEmpty) {
          widget.onTranscript(transcript);
        } else {
          widget.onError?.call('Could not understand audio. Please try again.');
        }
      } else {
        widget.onError?.call('Transcription failed. Please try again.');
      }
    } on TimeoutException {
      widget.onError?.call('Transcription timed out. Please try again.');
    } catch (e) {
      widget.onError?.call('Voice processing error.');
    } finally {
      // Clean up temp file
      try { await file.delete(); } catch (_) {}
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPressStart: (_) => _startRecording(),
      onLongPressEnd: (_) => _stopRecording(),
      child: AnimatedBuilder(
        animation: _pulseAnim,
        builder: (_, child) => Transform.scale(
          scale: _isRecording ? _pulseAnim.value : 1.0,
          child: child,
        ),
        child: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: _isRecording
                ? StashColors.error
                : _isProcessing
                    ? StashColors.warning
                    : StashColors.brand100,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: _isRecording ? StashColors.error : StashColors.divider,
            ),
          ),
          child: _isProcessing
              ? const Padding(
                  padding: EdgeInsets.all(12),
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: StashColors.brand600,
                  ),
                )
              : Icon(
                  _isRecording ? Icons.stop_rounded : Icons.mic_outlined,
                  color: _isRecording ? Colors.white : StashColors.brand600,
                  size: 22,
                ),
        ),
      ),
    );
  }
}

/// Compact recording status bar shown above the input when recording
class RecordingBar extends StatelessWidget {
  const RecordingBar({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: StashColors.error.withValues(alpha: 0.08),
      child: Row(
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: StashColors.error,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(
            'Recording... Release to send',
            style: GoogleFonts.googleSans(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: StashColors.error,
            ),
          ),
        ],
      ),
    );
  }
}
