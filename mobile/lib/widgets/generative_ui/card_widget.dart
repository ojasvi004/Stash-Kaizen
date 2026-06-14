import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants.dart';

class CardWidget extends StatelessWidget {
  final Map<String, dynamic> content;
  final String? title;

  const CardWidget({super.key, required this.content, this.title});

  @override
  Widget build(BuildContext context) {
    final items = (content['items'] as List<dynamic>?) ?? [];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null) ...[
          Text(
            title!,
            style: GoogleFonts.googleSans(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: StashColors.brand700,
            ),
          ),
          const SizedBox(height: 10),
        ],
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 1.6,
          ),
          itemCount: items.length,
          itemBuilder: (context, index) {
            final item = Map<String, dynamic>.from(items[index] as Map);
            return _buildCard(item);
          },
        ),
      ],
    );
  }

  Widget _buildCard(Map<String, dynamic> item) {
    final iconData = _iconFor(item['icon'] as String? ?? 'inventory');
    final trend = item['trend'] as String?;
    final isPositive = trend != null && !trend.startsWith('-');

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: StashColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(iconData, color: StashColors.brand500, size: 18),
              if (trend != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: isPositive
                        ? const Color(0xFFDCFCE7)
                        : const Color(0xFFFEE2E2),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    trend,
                    style: GoogleFonts.googleSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                      color: isPositive ? StashColors.success : StashColors.error,
                    ),
                  ),
                ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                item['value']?.toString() ?? '—',
                style: GoogleFonts.googleSans(
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                  color: StashColors.brand800,
                ),
              ),
              Text(
                item['title']?.toString() ?? '',
                style: GoogleFonts.googleSans(
                  fontSize: 10,
                  color: StashColors.textMuted,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ],
      ),
    );
  }

  IconData _iconFor(String key) {
    switch (key) {
      case 'orders': return Icons.shopping_cart_outlined;
      case 'revenue': return Icons.currency_rupee_rounded;
      case 'alert': return Icons.warning_amber_outlined;
      case 'supplier': return Icons.people_outline;
      case 'delivery': return Icons.local_shipping_outlined;
      case 'inventory': return Icons.inventory_2_outlined;
      default: return Icons.bar_chart_outlined;
    }
  }
}
