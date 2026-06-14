/// Chat message model
class ChatMessage {
  final String id;
  final String role; // "user" | "bot"
  final String text; // plain text / transcript for user messages
  final ChatResponse? response; // bot generative UI response
  final DateTime createdAt;
  final bool isVoice;
  final bool isFile;
  final String? fileName;

  const ChatMessage({
    required this.id,
    required this.role,
    required this.text,
    this.response,
    required this.createdAt,
    this.isVoice = false,
    this.isFile = false,
    this.fileName,
  });

  bool get isUser => role == 'user';
  bool get isBot => role == 'bot';
}

/// Bot response with generative UI structure
class ChatResponse {
  final String id;
  final String type; // text | list | table | chart | card | approval | mixed
  final String? title;
  final dynamic content; // varies by type
  final String voiceReply;
  final DateTime createdAt;

  const ChatResponse({
    required this.id,
    required this.type,
    this.title,
    required this.content,
    required this.voiceReply,
    required this.createdAt,
  });

  factory ChatResponse.fromJson(Map<String, dynamic> json) {
    return ChatResponse(
      id: json['id'] as String? ?? '',
      type: json['type'] as String? ?? 'text',
      title: json['title'] as String?,
      content: json['content'],
      voiceReply: json['voice_reply'] as String? ?? '',
      createdAt: DateTime.tryParse(json['created_at'] as String? ?? '') ?? DateTime.now(),
    );
  }
}

/// List item inside a "list" type response
class ListItem {
  final String label;
  final String? value;
  final String? badge; // ok | warn | error | info
  final String? subtitle;

  const ListItem({required this.label, this.value, this.badge, this.subtitle});

  factory ListItem.fromJson(Map<String, dynamic> json) {
    return ListItem(
      label: json['label'] as String? ?? '',
      value: json['value'] as String?,
      badge: json['badge'] as String?,
      subtitle: json['subtitle'] as String?,
    );
  }
}

/// Approval item inside an "approval" type response
class ApprovalItem {
  final String id;
  final String name;
  final num qty;
  final String unit;
  final num cost;
  String status; // pending | accepted | declined

  ApprovalItem({
    required this.id,
    required this.name,
    required this.qty,
    required this.unit,
    required this.cost,
    this.status = 'pending',
  });

  factory ApprovalItem.fromJson(Map<String, dynamic> json) {
    return ApprovalItem(
      id: json['id']?.toString() ?? '',
      name: json['name'] as String? ?? '',
      qty: (json['qty'] as num?) ?? 0,
      unit: json['unit'] as String? ?? 'units',
      cost: (json['cost'] as num?) ?? 0,
      status: json['status'] as String? ?? 'pending',
    );
  }
}
