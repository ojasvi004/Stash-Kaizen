import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'constants.dart';

class AuthService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
  );
  static const _tokenKey = 'stash_access_token';
  static const _userKey = 'stash_user';

  /// Login with phone + password — calls /api/auth/login
  static Future<Map<String, dynamic>> login(String phone, String password) async {
    try {
      final response = await ApiConstants.wrap(() => http.post(
        Uri.parse(ApiConstants.login),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'phone': phone, 'password': password}),
      ).timeout(const Duration(seconds: 10)));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as Map<String, dynamic>;
        final token = data['access_token'] as String;
        await _storage.write(key: _tokenKey, value: token);
        // Fetch user profile after login
        await fetchAndStoreProfile(token);
        return {'success': true, 'token': token};
      } else {
        String message = 'Invalid credentials. Please try again.';
        try {
          final err = jsonDecode(response.body);
          message = err['detail'] ?? message;
        } catch (_) {}
        return {'success': false, 'error': message};
      }
    } catch (e) {
      return {'success': false, 'error': 'Network Error. Is the backend running and reachable? ($e)'};
    }
  }

  /// Fetch profile from /api/auth/me and store locally
  static Future<Map<String, dynamic>?> fetchAndStoreProfile(String token) async {
    try {
      final resp = await ApiConstants.wrap(() => http.get(
        Uri.parse(ApiConstants.me),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 10)));
      if (resp.statusCode == 200) {
        final user = jsonDecode(resp.body) as Map<String, dynamic>;
        await _storage.write(key: _userKey, value: jsonEncode(user));
        return user;
      }
    } catch (_) {}
    return null;
  }

  /// Get stored JWT token
  static Future<String?> getToken() async {
    return _storage.read(key: _tokenKey);
  }

  /// Get stored user profile
  static Future<Map<String, dynamic>?> getUser() async {
    final raw = await _storage.read(key: _userKey);
    if (raw == null) return null;
    try {
      return jsonDecode(raw) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  /// Clear all auth data on logout
  static Future<void> logout() async {
    await _storage.delete(key: _tokenKey);
    await _storage.delete(key: _userKey);
  }

  /// Authorization header map
  static Future<Map<String, String>> authHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
}
