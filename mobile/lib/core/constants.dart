import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'dart:io' show Platform;
import 'package:flutter/foundation.dart' show kIsWeb;

/// Stash brand colors matching the web frontend exactly.
class StashColors {
  static const Color brand50 = Color(0xFFFDFCFB);
  static const Color brand100 = Color(0xFFF5F1EE);
  static const Color brand200 = Color(0xFFEADDD3);
  static const Color brand300 = Color(0xFFD4956A);
  static const Color brand400 = Color(0xFFB57A55);
  static const Color brand500 = Color(0xFF8B5E3C);
  static const Color brand600 = Color(0xFF6B4226); // Primary brown
  static const Color brand700 = Color(0xFF54341E);
  static const Color brand800 = Color(0xFF3D2616);
  static const Color brand900 = Color(0xFF26180E);

  static const Color surface = Color(0xFFFDFCFB);
  static const Color bgAlt = Color(0xFFF5F1EE);
  static const Color textPrimary = Color(0xFF202124);
  static const Color textMuted = Color(0xFF5F6368);
  static const Color divider = Color(0xFFE8EAED);

  static const Color success = Color(0xFF108548);
  static const Color warning = Color(0xFFF29900);
  static const Color error = Color(0xFFD93025);
  static const Color info = Color(0xFF1A73E8);

  static const Color userBubble = Color(0xFF6B4226);
  static const Color botBubble = Color(0xFFFFFFFF);
}

/// API endpoint constants.
class ApiConstants {
  static String _getLocalhost() {
    if (kIsWeb) return 'http://localhost:8000';
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8000'; // Redirects Android emulator to host machine localhost
      }
    } catch (_) {}
    return 'http://localhost:8000';
  }

  static String activeBaseUrl = 'https://stash-backend-2qjk.onrender.com';
  static final String fallbackBaseUrl = _getLocalhost();

  static String get baseUrl => activeBaseUrl;

  static String get login => '$baseUrl/api/auth/login';
  static String get me => '$baseUrl/api/auth/me';
  static String get chat => '$baseUrl/api/chat';
  static String get chatMultimodal => '$baseUrl/api/chat/multimodal';
  static String get chatVoice => '$baseUrl/api/chat/voice';
  static String get chatSuggestions => '$baseUrl/api/chat/suggestions';
  static String get stt => '$baseUrl/api/voice/stt';
  static String get tts => '$baseUrl/api/voice/tts';
  static String get dashboardAdmin => '$baseUrl/api/dashboard/admin';
  static String get forecastingAlerts => '$baseUrl/api/forecasting/alerts';

  /// Wrap network requests and log details if failure is detected
  static Future<T> wrap<T>(Future<T> Function() requestFn) async {
    try {
      return await requestFn();
    } catch (e) {
      debugPrint('Stash API call failed with error: $e');
      rethrow;
    }
  }
}
