import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import 'chat_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _showPassword = false;
  bool _loading = false;
  String _error = '';
  bool _touched = false;

  late AnimationController _fadeCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _fadeCtrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 700));
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);
    _slideAnim = Tween<Offset>(begin: const Offset(0, 0.06), end: Offset.zero)
        .animate(CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut));
    _fadeCtrl.forward();
  }

  @override
  void dispose() {
    _fadeCtrl.dispose();
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    setState(() { _touched = true; _error = ''; });
    if (!_formKey.currentState!.validate()) return;

    setState(() => _loading = true);
    final result = await AuthService.login(
      _phoneController.text.trim(),
      _passwordController.text,
    );
    if (!mounted) return;
    setState(() => _loading = false);

    if (result['success'] == true) {
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const ChatScreen(),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    } else {
      setState(() => _error = result['error'] ?? 'Login failed.');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StashColors.bgAlt,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: FadeTransition(
            opacity: _fadeAnim,
            child: SlideTransition(
              position: _slideAnim,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Brand Header
                  _buildBrand(),
                  const SizedBox(height: 48),

                  // Hero Text
                  Text(
                    'Welcome Back',
                    style: GoogleFonts.googleSans(
                      fontSize: 28,
                      fontWeight: FontWeight.w800,
                      color: StashColors.brand800,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Sign in to your admin account',
                    style: GoogleFonts.googleSans(
                      fontSize: 15,
                      color: StashColors.textMuted,
                    ),
                  ),
                  const SizedBox(height: 36),

                  // Form
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        // Error banner
                        if (_error.isNotEmpty) ...[
                          _buildErrorBanner(_error),
                          const SizedBox(height: 16),
                        ],

                        // Phone field
                        _buildLabel('Phone Number'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _phoneController,
                          keyboardType: TextInputType.phone,
                          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                          maxLength: 10,
                          decoration: const InputDecoration(
                            hintText: '10-digit phone number',
                            prefixIcon: Icon(Icons.phone_outlined, color: StashColors.brand500, size: 20),
                            counterText: '',
                          ),
                          validator: (v) {
                            if (!_touched) return null;
                            if (v == null || v.isEmpty) return 'Phone number is required.';
                            if (v.length != 10) return 'Enter a valid 10-digit phone number.';
                            return null;
                          },
                          onChanged: (_) { if (_error.isNotEmpty) setState(() => _error = ''); },
                        ),
                        const SizedBox(height: 4),
                        Padding(
                          padding: const EdgeInsets.only(left: 4),
                          child: Text(
                            'Use the mobile number linked to your account.',
                            style: GoogleFonts.googleSans(fontSize: 12, color: StashColors.textMuted),
                          ),
                        ),
                        const SizedBox(height: 20),

                        // Password field
                        _buildLabel('Password'),
                        const SizedBox(height: 8),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: !_showPassword,
                          decoration: InputDecoration(
                            hintText: '••••••••',
                            prefixIcon: const Icon(Icons.lock_outline, color: StashColors.brand500, size: 20),
                            suffixIcon: IconButton(
                              icon: Icon(
                                _showPassword ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                                color: StashColors.textMuted,
                                size: 20,
                              ),
                              onPressed: () => setState(() => _showPassword = !_showPassword),
                            ),
                          ),
                          validator: (v) {
                            if (!_touched) return null;
                            if (v == null || v.isEmpty) return 'Password is required.';
                            if (v.length < 6) return 'Password must be at least 6 characters.';
                            return null;
                          },
                          onChanged: (_) { if (_error.isNotEmpty) setState(() => _error = ''); },
                          onFieldSubmitted: (_) => _handleLogin(),
                        ),
                        const SizedBox(height: 32),

                        // Submit button
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton(
                            onPressed: _loading ? null : _handleLogin,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: StashColors.brand600,
                              disabledBackgroundColor: StashColors.brand300,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                              ),
                            ),
                            child: _loading
                                ? const SizedBox(
                                    width: 22,
                                    height: 22,
                                    child: CircularProgressIndicator(
                                      color: Colors.white,
                                      strokeWidth: 2.5,
                                    ),
                                  )
                                : Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Text(
                                        'Sign In',
                                        style: GoogleFonts.googleSans(
                                          fontSize: 16,
                                          fontWeight: FontWeight.w700,
                                          color: Colors.white,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      const Icon(Icons.arrow_forward_rounded, color: Colors.white, size: 20),
                                    ],
                                  ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 40),

                  // Stats row
                  _buildStatsRow(),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBrand() {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: StashColors.brand600,
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Icon(Icons.warehouse_outlined, color: Colors.white, size: 24),
        ),
        const SizedBox(width: 12),
        Text(
          'STASH',
          style: GoogleFonts.googleSans(
            fontSize: 22,
            fontWeight: FontWeight.w800,
            color: StashColors.brand600,
            letterSpacing: 1.5,
          ),
        ),
      ],
    );
  }

  Widget _buildLabel(String text) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Text(
        text,
        style: GoogleFonts.googleSans(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: StashColors.brand800,
        ),
      ),
    );
  }

  Widget _buildErrorBanner(String message) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFFFEF2F2),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFFFECACA)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber_rounded, color: StashColors.error, size: 18),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: GoogleFonts.googleSans(fontSize: 13, color: StashColors.error),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        _statChip('500+', 'Warehouses'),
        const SizedBox(width: 12),
        _statChip('99.9%', 'Uptime'),
        const SizedBox(width: 12),
        _statChip('AI-First', 'Platform'),
      ],
    );
  }

  Widget _statChip(String value, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14),
        decoration: BoxDecoration(
          color: StashColors.surface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: StashColors.divider),
        ),
        child: Column(
          children: [
            Text(
              value,
              style: GoogleFonts.googleSans(
                fontSize: 16,
                fontWeight: FontWeight.w800,
                color: StashColors.brand700,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: GoogleFonts.googleSans(fontSize: 11, color: StashColors.textMuted),
            ),
          ],
        ),
      ),
    );
  }
}
