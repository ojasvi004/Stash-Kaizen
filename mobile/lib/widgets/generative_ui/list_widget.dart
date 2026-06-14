import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants.dart';
import '../../models/chat_message.dart';

class ListWidget extends StatelessWidget {
  final Map<String, dynamic> content;
  final String? title;

  const ListWidget({super.key, required this.content, this.title});

  @override
  Widget build(BuildContext context) {
    final rawItems = content['items'] as List<dynamic>? ?? [];
    final items = rawItems
        .map((e) => ListItem.fromJson(Map<String, dynamic>.from(e as Map)))
        .toList();

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
        ...items.map((item) => _buildListItem(item)),
      ],
    );
  }

  Widget _buildListItem(ListItem item) {
    final badgeColor = _badgeColor(item.badge);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: StashColors.divider),
      ),
      child: Row(
        children: [
          if (item.badge != null) ...[
            Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                color: badgeColor,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 10),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.label,
                  style: GoogleFonts.googleSans(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: StashColors.textPrimary,
                  ),
                ),
                if (item.subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    item.subtitle!,
                    style: GoogleFonts.googleSans(
                      fontSize: 11,
                      color: StashColors.textMuted,
                    ),
                  ),
                ],
              ],
            ),
          ),
          if (item.value != null)
            Text(
              item.value!,
              style: GoogleFonts.googleSans(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: StashColors.brand700,
              ),
            ),
        ],
      ),
    );
  }

  Color _badgeColor(String? badge) {
    switch (badge) {
      case 'error': return StashColors.error;
      case 'warn': return StashColors.warning;
      case 'ok': return StashColors.success;
      case 'info': return StashColors.info;
      default: return StashColors.brand400;
    }
  }
}
