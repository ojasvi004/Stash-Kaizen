import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/constants.dart';

class _RestockItem {
  final int id;
  final String name;
  final int eoqQty;
  final String unit;
  final double unitCost;
  String status = 'pending';

  _RestockItem({
    required this.id,
    required this.name,
    required this.eoqQty,
    required this.unit,
    required this.unitCost,
  });

  double get totalCost => eoqQty * unitCost;
}

class RestockScreen extends StatefulWidget {
  const RestockScreen({super.key});

  @override
  State<RestockScreen> createState() => _RestockScreenState();
}

class _RestockScreenState extends State<RestockScreen> {
  List<_RestockItem> _items = [];
  bool _loading = true;

  // Static EOQ data matching the web's restock page
  final List<_RestockItem> _mockItems = [
    _RestockItem(id: 1, name: 'Basmati Rice', eoqQty: 500, unit: 'kg', unitCost: 110),
    _RestockItem(id: 2, name: 'Toor Dal', eoqQty: 250, unit: 'kg', unitCost: 145),
    _RestockItem(id: 3, name: 'Refined Sunflower Oil', eoqQty: 150, unit: 'L', unitCost: 105),
    _RestockItem(id: 4, name: 'Wheat Flour (Atta)', eoqQty: 800, unit: 'kg', unitCost: 35),
    _RestockItem(id: 5, name: 'Sugar', eoqQty: 300, unit: 'kg', unitCost: 42),
  ];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    // Forcing static mock data for EOQ as requested
    setState(() {
      _items = _mockItems;
      _loading = false;
    });
  }

  void _handleAction(int index, String action) {
    setState(() => _items[index].status = action);
  }

  double get _totalAccepted => _items
      .where((i) => i.status == 'accepted')
      .fold(0.0, (sum, i) => sum + i.totalCost);

  int get _pendingCount => _items.where((i) => i.status == 'pending').length;

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
        title: Row(
          children: [
            const Icon(Icons.trending_up_rounded, color: StashColors.brand600, size: 20),
            const SizedBox(width: 8),
            Text(
              'Smart Restock',
              style: GoogleFonts.googleSans(
                fontSize: 18,
                fontWeight: FontWeight.w700,
                color: StashColors.brand800,
              ),
            ),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator(color: StashColors.brand600))
          : Column(
              children: [
                // Summary cards
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    children: [
                      Expanded(child: _summaryCard(
                        icon: Icons.calculate_outlined,
                        label: 'Accepted Cost',
                        value: '₹${_totalAccepted.toStringAsFixed(0)}',
                        color: StashColors.success,
                      )),
                      const SizedBox(width: 12),
                      Expanded(child: _summaryCard(
                        icon: Icons.pending_outlined,
                        label: 'Pending Approvals',
                        value: '$_pendingCount',
                        color: StashColors.warning,
                      )),
                    ],
                  ),
                ),

                // Description
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Text(
                    'Optimal order quantities based on the EOQ model to minimize holding and ordering costs.',
                    style: GoogleFonts.googleSans(fontSize: 12, color: StashColors.textMuted, height: 1.4),
                  ),
                ),
                const SizedBox(height: 12),

                // Items list
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _items.length,
                    itemBuilder: (context, index) => _buildItemCard(_items[index], index),
                  ),
                ),
              ],
            ),
    );
  }

  Widget _summaryCard({
    required IconData icon,
    required String label,
    required String value,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: StashColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: StashColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  label,
                  style: GoogleFonts.googleSans(fontSize: 11, color: StashColors.textMuted),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: GoogleFonts.googleSans(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: StashColors.brand800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildItemCard(_RestockItem item, int index) {
    final isPending = item.status == 'pending';
    final isAccepted = item.status == 'accepted';

    return AnimatedOpacity(
      opacity: isPending ? 1.0 : 0.65,
      duration: const Duration(milliseconds: 250),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: StashColors.surface,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: isPending
                ? StashColors.divider
                : isAccepted
                    ? StashColors.success.withValues(alpha: 0.4)
                    : StashColors.error.withValues(alpha: 0.3),
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
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                      color: StashColors.brand800,
                    ),
                  ),
                ),
                if (!isPending)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isAccepted
                          ? StashColors.success.withValues(alpha: 0.1)
                          : StashColors.error.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      isAccepted ? '✓ Accepted' : '✗ Declined',
                      style: GoogleFonts.googleSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isAccepted ? StashColors.success : StashColors.error,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _chip('${item.eoqQty} ${item.unit}'),
                const SizedBox(width: 6),
                _chip('₹${item.unitCost.toInt()}/${item.unit}'),
                const Spacer(),
                Text(
                  'Total: ₹${item.totalCost.toStringAsFixed(0)}',
                  style: GoogleFonts.googleSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                    color: StashColors.brand700,
                  ),
                ),
              ],
            ),
            if (isPending) ...[
              const SizedBox(height: 12),
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
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: GoogleFonts.googleSans(fontSize: 13, fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _handleAction(index, 'accepted'),
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Accept'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: StashColors.success,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        textStyle: GoogleFonts.googleSans(fontSize: 13, fontWeight: FontWeight.w600),
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

  Widget _chip(String text) {
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
