class UserModel {
  final String id;
  final String name;
  final String phone;
  final String? email;
  final String role;

  const UserModel({
    required this.id,
    required this.name,
    required this.phone,
    this.email,
    this.role = 'admin',
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? 'Admin',
      phone: json['phone'] as String? ?? '',
      email: json['email'] as String?,
      role: json['role'] as String? ?? 'admin',
    );
  }

  String get initials {
    final parts = name.trim().split(' ');
    if (parts.isEmpty) return 'A';
    if (parts.length == 1) return parts[0].substring(0, 1).toUpperCase();
    return '${parts[0][0]}${parts.last[0]}'.toUpperCase();
  }
}
