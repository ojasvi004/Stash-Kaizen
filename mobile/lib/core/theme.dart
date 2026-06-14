import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'constants.dart';

class StashTheme {
  static ThemeData lightTheme() {
    final base = ThemeData.light(useMaterial3: true);

    return base.copyWith(
      colorScheme: ColorScheme.fromSeed(
        seedColor: StashColors.brand600,
        primary: StashColors.brand600,
        secondary: StashColors.brand500,
        surface: StashColors.surface,
        error: StashColors.error,
        brightness: Brightness.light,
      ),
      textTheme: GoogleFonts.googleSansTextTheme(base.textTheme).copyWith(
        headlineLarge: GoogleFonts.googleSans(
          fontSize: 28,
          fontWeight: FontWeight.w800,
          color: StashColors.brand800,
          letterSpacing: -0.5,
        ),
        headlineMedium: GoogleFonts.googleSans(
          fontSize: 22,
          fontWeight: FontWeight.w700,
          color: StashColors.brand800,
        ),
        titleLarge: GoogleFonts.googleSans(
          fontSize: 18,
          fontWeight: FontWeight.w700,
          color: StashColors.brand800,
        ),
        titleMedium: GoogleFonts.googleSans(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: StashColors.textPrimary,
        ),
        bodyLarge: GoogleFonts.googleSans(
          fontSize: 15,
          color: StashColors.textPrimary,
        ),
        bodyMedium: GoogleFonts.googleSans(
          fontSize: 14,
          color: StashColors.textPrimary,
        ),
        bodySmall: GoogleFonts.googleSans(
          fontSize: 12,
          color: StashColors.textMuted,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: StashColors.surface,
        foregroundColor: StashColors.brand800,
        elevation: 0,
        scrolledUnderElevation: 1,
        shadowColor: StashColors.divider,
        centerTitle: false,
        titleTextStyle: GoogleFonts.googleSans(
          fontSize: 22,
          fontWeight: FontWeight.w800,
          color: StashColors.brand600,
          letterSpacing: -0.5,
        ),
        iconTheme: const IconThemeData(color: StashColors.brand700),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: StashColors.bgAlt,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: const BorderSide(color: StashColors.brand200, width: 1),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(24),
          borderSide: const BorderSide(color: StashColors.error),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        hintStyle: GoogleFonts.googleSans(color: StashColors.textMuted, fontSize: 14),
        labelStyle: GoogleFonts.googleSans(color: StashColors.textMuted, fontSize: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: StashColors.brand600,
          foregroundColor: Colors.white,
          minimumSize: const Size(double.infinity, 52),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          elevation: 0,
          textStyle: GoogleFonts.googleSans(fontSize: 16, fontWeight: FontWeight.w700),
        ),
      ),
      cardTheme: CardThemeData(
        color: StashColors.surface,
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: StashColors.divider),
        ),
        margin: const EdgeInsets.symmetric(vertical: 4, horizontal: 0),
      ),
      scaffoldBackgroundColor: StashColors.surface,
      dividerColor: StashColors.divider,
    );
  }
}
