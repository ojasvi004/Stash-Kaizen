import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants.dart';
import '../../models/chat_message.dart';

class ApprovalWidget extends StatefulWidget {
  final Map<String, dynamic> content;
  final String? title;

  const ApprovalWidget({super.key, required this.content, this.title});

  @override
  State<ApprovalWidget> createState() => _ApprovalWidgetState();
}

class _ApprovalWidgetState extends State<ApprovalWidget> {
  late List<ApprovalItem> _items;
  num _totalAccepted = 0;

  @override
  void initState() {
    super.initState();
    final rawItems = widget.content['items'] as List<dynamic>? ?? [];
    _items = rawItems
        .map((e) => ApprovalItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();
  }

  void _handleAction(int index, String action) {
    setState(() {
      _items[index].status = action;
      _totalAccepted = _items
          .where((i) => i.status == 'accepted')
          .fold(0, (sum, i) => sum + (i.qty * i.cost));
    });
  }

  @override
  Widget build(BuildContext context) {
    final pending = _items.where((i) => i.status == 'pending').length;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.title != null) ...[
          Text(
            widget.title!,
            style: GoogleFonts.googleSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: StashColors.brand700,
            ),
          ),
          const SizedBox(height: 10),
        ],

        // Summary row
        Row(
          children: [
            _summaryChip(
              Icons.pending_outlined,
              '$pending Pending',
              StashColors.warning,
            ),
            const SizedBox(width: 8),
            _summaryChip(
              Icons.currency_rupee_rounded,
              '₹${_totalAccepted.toStringAsFixed(0)} approved',
              StashColors.success,
            ),
          ],
        ),
        const SizedBox(height: 10),

        // Items
        ..._items.asMap().entries.map((entry) {
          final i = entry.key;
          final item = entry.value;
          return _buildApprovalCard(item, i);
        }),
      ],
    );
  }

  Widget _summaryChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.googleSans(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildApprovalCard(ApprovalItem item, int index) {
    final isPending = item.status == 'pending';
    final totalCost = item.qty * item.cost;

    return AnimatedOpacity(
      opacity: isPending ? 1.0 : 0.65,
      duration: const Duration(milliseconds: 300),
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isPending
                ? StashColors.divider
                : item.status == 'accepted'
                    ? StashColors.success.withValues(alpha: 0.4)
                    : StashColors.error.withValues(alpha: 0.4),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    item.name,
                    style: GoogleFonts.googleSans(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: StashColors.textPrimary,
                    ),
                  ),
                ),
                if (!isPending)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: item.status == 'accepted'
                          ? StashColors.success.withValues(alpha: 0.1)
                          : StashColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      item.status == 'accepted' ? 'Accepted' : 'Declined',
                      style: GoogleFonts.googleSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: item.status == 'accepted' ? StashColors.success : StashColors.error,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Row(
              children: [
                _infoChip('${item.qty} ${item.unit}'),
                const SizedBox(width: 6),
                _infoChip('₹${item.cost}/${item.unit}'),
                const SizedBox(width: 6),
                Text(
                  'Total: ₹${totalCost.toStringAsFixed(0)}',
                  style: GoogleFonts.googleSans(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: StashColors.brand700,
                  ),
                ),
              ],
            ),
            if (isPending) ...[
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _handleAction(index, 'declined'),
                      icon: const Icon(Icons.close, size: 16),
                      label: const Text('Decline'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: StashColors.error,
                        side: const BorderSide(color: StashColors.error),
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        textStyle: GoogleFonts.googleSans(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleAction(index, 'accepted'),
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Accept'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: StashColors.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        textStyle: GoogleFonts.googleSans(fontSize: 12, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoChip(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: StashColors.bgAlt,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: StashColors.divider),
      ),
      child: Text(
        text,
        style: GoogleFonts.googleSans(fontSize: 11, color: StashColors.textMuted),
      ),
    );
  }
}
