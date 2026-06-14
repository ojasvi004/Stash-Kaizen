import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants.dart';

class TableWidget extends StatelessWidget {
  final Map<String, dynamic> content;
  final String? title;

  const TableWidget({super.key, required this.content, this.title});

  @override
  Widget build(BuildContext context) {
    final headers = (content['headers'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];
    final rows = (content['rows'] as List<dynamic>?)
            ?.map((row) => (row as List<dynamic>).map((e) => e.toString()).toList())
            .toList() ??
        [];

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
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: DataTable(
              headingRowColor: WidgetStateProperty.all(StashColors.brand100),
              dataRowColor: WidgetStateProperty.resolveWith((states) {
                if (states.contains(WidgetState.selected)) return StashColors.brand50;
                return Colors.white;
              }),
              border: TableBorder.all(
                color: StashColors.divider,
                borderRadius: BorderRadius.circular(12),
              ),
              headingTextStyle: GoogleFonts.googleSans(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: StashColors.brand700,
              ),
              dataTextStyle: GoogleFonts.googleSans(
                fontSize: 12,
                color: StashColors.textPrimary,
              ),
              columnSpacing: 20,
              horizontalMargin: 12,
              columns: headers
                  .map((h) => DataColumn(label: Text(h)))
                  .toList(),
              rows: rows
                  .map(
                    (row) => DataRow(
                      cells: row.map((cell) => DataCell(Text(cell))).toList(),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),
      ],
    );
  }
}
