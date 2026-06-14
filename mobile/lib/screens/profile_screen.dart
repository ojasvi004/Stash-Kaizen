import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/auth_service.dart';
import '../core/constants.dart';
import '../models/user.dart';
import 'login_screen.dart';
import 'notifications_screen.dart';
import 'restock_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  UserModel? _user;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    final data = await AuthService.getUser();
    if (mounted) {
      setState(() {
        _user = data != null ? UserModel.fromJson(data) : null;
        _loading = false;
      });
    }
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Logout', style: GoogleFonts.googleSans(fontWeight: FontWeight.w700)),
        content: Text(
          'Are you sure you want to sign out?',
          style: GoogleFonts.googleSans(color: StashColors.textMuted),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text('Cancel', style: GoogleFonts.googleSans(color: StashColors.textMuted)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: StashColors.error,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text('Logout', style: GoogleFonts.googleSans(fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
    if (confirm == true) {
      await AuthService.logout();
      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (_) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StashColors.bgAlt,
      appBar: AppBar(
        backgroundColor: StashColors.surface,
        title: Text(
          'Profile',
          style: GoogleFonts.googleSans(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: StashColors.brand800,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: StashColors.brand700),
          onPressed: () => Navigator.pop(context),
        ),
        elevation: 0,
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: StashColors.brand600))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  _buildProfileCard(),
                  const SizedBox(height: 20),
                  _buildActionCards(),
                  const SizedBox(height: 24),
                  _buildLogoutButton(),
                  const SizedBox(height: 32),
                  _buildVersion(),
                ],
              ),
            ),
    );
  }

  Widget _buildProfileCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: StashColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: StashColors.divider),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          // Avatar
          Container(
            width: 80,
            height: 80,
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [StashColors.brand500, StashColors.brand700],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                _user?.initials ?? 'A',
                style: GoogleFonts.googleSans(
                  fontSize: 28,
                  fontWeight: FontWeight.w800,
                  color: Colors.white,
                ),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Name
          Text(
            _user?.name ?? 'Admin',
            style: GoogleFonts.googleSans(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: StashColors.brand800,
            ),
          ),
          const SizedBox(height: 4),

          // Role badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: StashColors.brand100,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              (_user?.role ?? 'admin').toUpperCase(),
              style: GoogleFonts.googleSans(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: StashColors.brand700,
                letterSpacing: 1,
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Divider(color: StashColors.divider),
          const SizedBox(height: 16),

          // Info rows
          _infoRow(Icons.phone_outlined, 'Phone', _user?.phone ?? '—'),
          if (_user?.email != null && _user!.email!.isNotEmpty) ...[
            const SizedBox(height: 12),
            _infoRow(Icons.email_outlined, 'Email', _user!.email!),
          ],
        ],
      ),
    );
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Row(
      children: [
        Icon(icon, size: 18, color: StashColors.brand500),
        const SizedBox(width: 12),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: GoogleFonts.googleSans(fontSize: 11, color: StashColors.textMuted)),
            Text(
              value,
              style: GoogleFonts.googleSans(fontSize: 14, fontWeight: FontWeight.w600, color: StashColors.textPrimary),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildActionCards() {
    return Column(
      children: [
        _actionTile(
          icon: Icons.notifications_outlined,
          label: 'Updates & Notifications',
          subtitle: 'Stock alerts, order updates',
          color: StashColors.info,
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const NotificationsScreen()),
          ),
        ),
        const SizedBox(height: 12),
        _actionTile(
          icon: Icons.trending_up_rounded,
          label: 'Restock Approvals',
          subtitle: 'Review EOQ-based suggestions',
          color: StashColors.brand600,
          onTap: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const RestockScreen()),
          ),
        ),
      ],
    );
  }

  Widget _actionTile({
    required IconData icon,
    required String label,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: StashColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: StashColors.divider),
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: GoogleFonts.googleSans(
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: StashColors.textPrimary,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: GoogleFonts.googleSans(fontSize: 12, color: StashColors.textMuted),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: StashColors.textMuted),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutButton() {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: _logout,
        icon: const Icon(Icons.logout_rounded, size: 18),
        label: const Text('Logout'),
        style: OutlinedButton.styleFrom(
          foregroundColor: StashColors.error,
          side: const BorderSide(color: StashColors.error),
          padding: const EdgeInsets.symmetric(vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
          textStyle: GoogleFonts.googleSans(fontSize: 15, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }

  Widget _buildVersion() {
    return Text(
      'Stash v1.0.0 • Admin Console',
      style: GoogleFonts.googleSans(fontSize: 12, color: StashColors.textMuted),
    );
  }
}
