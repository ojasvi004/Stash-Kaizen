import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import '../core/constants.dart';

typedef FileSelectedCallback = void Function(File file, String fileName);

class FileUploadButton extends StatelessWidget {
  final FileSelectedCallback onFileSelected;

  const FileUploadButton({super.key, required this.onFileSelected});

  Future<void> _pickFile(BuildContext context) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['jpg', 'jpeg', 'png', 'pdf', 'csv', 'xlsx', 'txt'],
        withData: false,
        withReadStream: false,
      );

      if (result != null && result.files.isNotEmpty) {
        final picked = result.files.first;
        if (picked.path != null) {
          onFileSelected(File(picked.path!), picked.name);
        }
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not pick file: $e'),
            backgroundColor: StashColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _pickFile(context),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: StashColors.brand100,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: StashColors.divider),
        ),
        child: const Icon(
          Icons.attach_file_rounded,
          color: StashColors.brand600,
          size: 22,
        ),
      ),
    );
  }
}
