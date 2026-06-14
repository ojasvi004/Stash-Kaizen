import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants.dart';

class ChartWidget extends StatelessWidget {
  final Map<String, dynamic> content;
  final String? title;

  const ChartWidget({super.key, required this.content, this.title});

  @override
  Widget build(BuildContext context) {
    final chartType = content['chart_type'] as String? ?? 'bar';
    final labels = (content['labels'] as List<dynamic>?)
            ?.map((e) => e.toString())
            .toList() ??
        [];
    final datasets = (content['datasets'] as List<dynamic>?) ?? [];

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
          const SizedBox(height: 12),
        ],
        SizedBox(
          height: 200,
          child: switch (chartType) {
            'line' => _buildLineChart(labels, datasets),
            'pie' => _buildPieChart(labels, datasets),
            _ => _buildBarChart(labels, datasets),
          },
        ),
        // Legend
        if (datasets.length > 1) ...[
          const SizedBox(height: 10),
          Wrap(
            spacing: 16,
            children: datasets.map((ds) {
              final label = ds['label'] as String? ?? '';
              final colorStr = ds['color'] as String? ?? '#6B4226';
              final color = _hexColor(colorStr);
              return Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
                  const SizedBox(width: 4),
                  Text(label, style: GoogleFonts.googleSans(fontSize: 11, color: StashColors.textMuted)),
                ],
              );
            }).toList(),
          ),
        ],
      ],
    );
  }

  Widget _buildBarChart(List<String> labels, List<dynamic> datasets) {
    if (labels.isEmpty || datasets.isEmpty) return const SizedBox.shrink();

    final ds = Map<String, dynamic>.from(datasets[0] as Map);
    final values = (ds['values'] as List<dynamic>?)?.map((e) => (e as num).toDouble()).toList() ?? [];
    final colorStr = ds['color'] as String? ?? '#6B4226';
    final color = _hexColor(colorStr);
    final maxY = values.isEmpty ? 10.0 : values.fold<double>(0.0, (a, b) => a > b ? a : b) * 1.2;

    return BarChart(
      BarChartData(
        maxY: maxY,
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipColor: (_) => StashColors.brand800,
            getTooltipItem: (group, groupIndex, rod, rodIndex) {
              return BarTooltipItem(
                rod.toY.toStringAsFixed(0),
                GoogleFonts.googleSans(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              );
            },
          ),
        ),
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx < 0 || idx >= labels.length) return const SizedBox.shrink();
                return Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    labels[idx].length > 6 ? labels[idx].substring(0, 5) : labels[idx],
                    style: GoogleFonts.googleSans(fontSize: 9, color: StashColors.textMuted),
                  ),
                );
              },
              reservedSize: 28,
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) => Text(
                value.toStringAsFixed(0),
                style: GoogleFonts.googleSans(fontSize: 9, color: StashColors.textMuted),
              ),
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) => const FlLine(color: StashColors.divider, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        barGroups: values.asMap().entries.map((e) {
          return BarChartGroupData(
            x: e.key,
            barRods: [
              BarChartRodData(
                toY: e.value,
                color: color,
                width: 18,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(6)),
                backDrawRodData: BackgroundBarChartRodData(
                  show: true,
                  toY: maxY,
                  color: StashColors.divider.withValues(alpha: 0.3),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }

  Widget _buildLineChart(List<String> labels, List<dynamic> datasets) {
    if (labels.isEmpty || datasets.isEmpty) return const SizedBox.shrink();

    final lineBarsData = datasets.map((ds) {
      final map = Map<String, dynamic>.from(ds as Map);
      final values = (map['values'] as List<dynamic>?)?.map((e) => (e as num).toDouble()).toList() ?? [];
      final colorStr = map['color'] as String? ?? '#6B4226';
      final color = _hexColor(colorStr);
      return LineChartBarData(
        spots: values.asMap().entries.map((e) => FlSpot(e.key.toDouble(), e.value)).toList(),
        isCurved: true,
        color: color,
        barWidth: 2.5,
        belowBarData: BarAreaData(show: true, color: color.withValues(alpha: 0.1)),
        dotData: const FlDotData(show: false),
      );
    }).toList();

    final allValues = <double>[];
    for (final ds in datasets) {
      final vals = (ds['values'] as List<dynamic>?)?.map((e) => (e as num).toDouble()) ?? <double>[];
      allValues.addAll(vals);
    }
    final maxY = allValues.isEmpty ? 10.0 : allValues.fold<double>(0.0, (a, b) => a > b ? a : b) * 1.2;

    return LineChart(
      LineChartData(
        lineBarsData: lineBarsData,
        maxY: maxY,
        minY: 0,
        titlesData: FlTitlesData(
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                final idx = value.toInt();
                if (idx < 0 || idx >= labels.length) return const SizedBox.shrink();
                return Text(
                  labels[idx].length > 4 ? labels[idx].substring(0, 4) : labels[idx],
                  style: GoogleFonts.googleSans(fontSize: 9, color: StashColors.textMuted),
                );
              },
              reservedSize: 24,
            ),
          ),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 40,
              getTitlesWidget: (value, meta) => Text(
                value.toStringAsFixed(0),
                style: GoogleFonts.googleSans(fontSize: 9, color: StashColors.textMuted),
              ),
            ),
          ),
          topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
        ),
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          getDrawingHorizontalLine: (_) => const FlLine(color: StashColors.divider, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
      ),
    );
  }

  Widget _buildPieChart(List<String> labels, List<dynamic> datasets) {
    if (datasets.isEmpty) return const SizedBox.shrink();

    final ds = Map<String, dynamic>.from(datasets[0] as Map);
    final values = (ds['values'] as List<dynamic>?)?.map((e) => (e as num).toDouble()).toList() ?? [];
    
    final pieColors = [
      StashColors.brand600,
      StashColors.brand400,
      StashColors.brand300,
      StashColors.info,
      StashColors.success,
    ];

    return PieChart(
      PieChartData(
        sections: values.asMap().entries.map((e) {
          final label = e.key < labels.length ? labels[e.key] : '';
          return PieChartSectionData(
            value: e.value,
            title: e.value > 5 ? label : '',
            color: pieColors[e.key % pieColors.length],
            radius: 70,
            titleStyle: GoogleFonts.googleSans(fontSize: 10, fontWeight: FontWeight.w600, color: Colors.white),
          );
        }).toList(),
        centerSpaceRadius: 30,
        sectionsSpace: 2,
      ),
    );
  }

  Color _hexColor(String hex) {
    try {
      final clean = hex.replaceAll('#', '');
      return Color(int.parse('FF$clean', radix: 16));
    } catch (_) {
      return StashColors.brand600;
    }
  }
}
