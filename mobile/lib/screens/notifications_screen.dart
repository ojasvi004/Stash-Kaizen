import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<_Notification> _notifications = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
  }

  Future<void> _fetchNotifications() async {
    // Forcing static mock data as requested
    final notifs = <_Notification>[];
    _addStaticNotifications(notifs);
    setState(() {
      _notifications = notifs;
      _loading = false;
    });
  }

  void _addStaticNotifications(List<_Notification> notifs) {
    notifs.add(const _Notification(
      icon: Icons.inventory_2_outlined,
      iconColor: StashColors.warning,
      title: 'Low Stock Warning',
      body: 'Basmati Rice — only 15 kg remaining (threshold: 50 kg)',
      time: 'Just now',
      type: 'warning',
    ));
    notifs.add(const _Notification(
      icon: Icons.currency_rupee_rounded,
      iconColor: StashColors.brand600,
      title: 'Pending Collections',
      body: '₹4,500 in unpaid bills from today',
      time: '2h ago',
      type: 'payment',
    ));
    notifs.add(const _Notification(
      icon: Icons.shopping_cart_outlined,
      iconColor: StashColors.info,
      title: 'New Order — ORD-8092',
      body: 'Status: Pending • ₹1,200',
      time: '1d ago',
      type: 'order',
    ));
  }


  void _dismiss(int index) {
    setState(() => _notifications.removeAt(index));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: StashColors.bgAlt,
      appBar: AppBar(
        backgroundColor: StashColors.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: StashColors.brand700),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'Updates',
          style: GoogleFonts.googleSans(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            color: StashColors.brand800,
          ),
        ),
        actions: [
          if (_notifications.isNotEmpty)
            TextButton(
              onPressed: () => setState(() => _notifications.clear()),
              child: Text(
                'Clear All',
                style: GoogleFonts.googleSans(fontSize: 13, color: StashColors.brand600),
              ),
            ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: StashColors.brand600))
          : _notifications.isEmpty
              ? _buildEmpty()
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _notifications.length,
                  itemBuilder: (context, index) => _buildCard(_notifications[index], index),
                ),
    );
  }

  Widget _buildCard(_Notification notif, int index) {
    return Dismissible(
      key: Key('notif_$index'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _dismiss(index),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 16),
        decoration: BoxDecoration(
          color: StashColors.error.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Icon(Icons.delete_outline, color: StashColors.error),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: StashColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: notif.type == 'critical'
                ? StashColors.error.withValues(alpha: 0.3)
                : StashColors.divider,
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: notif.iconColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(notif.icon, color: notif.iconColor, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notif.title,
                          style: GoogleFonts.googleSans(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: StashColors.textPrimary,
                          ),
                        ),
                      ),
                      Text(
                        notif.time,
                        style: GoogleFonts.googleSans(fontSize: 11, color: StashColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notif.body,
                    style: GoogleFonts.googleSans(fontSize: 12, color: StashColors.textMuted, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.notifications_none_outlined, size: 56, color: StashColors.brand300),
          const SizedBox(height: 16),
          Text(
            'All caught up!',
            style: GoogleFonts.googleSans(fontSize: 18, fontWeight: FontWeight.w700, color: StashColors.brand800),
          ),
          const SizedBox(height: 6),
          Text(
            'No new notifications right now.',
            style: GoogleFonts.googleSans(fontSize: 14, color: StashColors.textMuted),
          ),
        ],
      ),
    );
  }
}

class _Notification {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String body;
  final String time;
  final String type;

  const _Notification({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.body,
    required this.time,
    required this.type,
  });
}
