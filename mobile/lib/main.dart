import 'package:flutter/material.dart';
import 'core/auth_service.dart';
import 'core/constants.dart';
import 'core/theme.dart';
import 'screens/login_screen.dart';
import 'screens/chat_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const StashApp());
}

class StashApp extends StatelessWidget {
  const StashApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Stash',
      debugShowCheckedModeBanner: false,
      theme: StashTheme.lightTheme(),
      home: const AppGate(),
    );
  }
}

/// Decides whether to show Login or Chat screen based on auth state.
class AppGate extends StatefulWidget {
  const AppGate({super.key});

  @override
  State<AppGate> createState() => _AppGateState();
}

class _AppGateState extends State<AppGate> {
  bool _loading = true;
  bool _authenticated = false;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await AuthService.getToken();
    setState(() {
      _authenticated = token != null && token.isNotEmpty;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        backgroundColor: StashColors.surface,
        body: Center(
          child: CircularProgressIndicator(color: StashColors.brand600),
        ),
      );
    }
    return _authenticated ? const ChatScreen() : const LoginScreen();
  }
}
