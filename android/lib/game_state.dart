import 'dart:convert';

enum GameMode { oneVOne, threePlayer, fourPlayer }

extension GameModeX on GameMode {
  int get playerCount => switch (this) {
        GameMode.oneVOne => 2,
        GameMode.threePlayer => 3,
        GameMode.fourPlayer => 4,
      };

  String get label => switch (this) {
        GameMode.oneVOne => '1v1',
        GameMode.threePlayer => '3 Players',
        GameMode.fourPlayer => '4 Players',
      };

  String get serialized => switch (this) {
        GameMode.oneVOne => '1v1',
        GameMode.threePlayer => '3p',
        GameMode.fourPlayer => '4p',
      };

  static GameMode fromSerialized(String s) => switch (s) {
        '3p' => GameMode.threePlayer,
        '4p' => GameMode.fourPlayer,
        _ => GameMode.oneVOne,
      };
}

class FormatConfig {
  final String id;
  final String label;
  final int startingLife;
  final int poisonLethal;

  const FormatConfig({
    required this.id,
    required this.label,
    required this.startingLife,
    required this.poisonLethal,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'startingLife': startingLife,
        'poisonLethal': poisonLethal,
      };

  factory FormatConfig.fromJson(Map<String, dynamic> json) => FormatConfig(
        id: json['id'] as String,
        label: json['label'] as String,
        startingLife: json['startingLife'] as int,
        poisonLethal: json['poisonLethal'] as int,
      );
}

class Formats {
  static const standard = FormatConfig(
    id: 'standard',
    label: 'Standard',
    startingLife: 20,
    poisonLethal: 10,
  );
  static const commander = FormatConfig(
    id: 'commander',
    label: 'Commander',
    startingLife: 40,
    poisonLethal: 10,
  );
  static const twoHeadedGiant = FormatConfig(
    id: 'twoHeadedGiant',
    label: 'Two-Headed Giant',
    startingLife: 30,
    poisonLethal: 15,
  );

  static FormatConfig custom(int startingLife) =>
      FormatConfig(id: 'custom', label: 'Custom', startingLife: startingLife, poisonLethal: 10);

  static const List<FormatConfig> presets = [standard, commander, twoHeadedGiant];
}

class Player {
  final int id;
  final String name;
  final int lifeTotal;
  final int poisonCounters;

  const Player({
    required this.id,
    required this.name,
    required this.lifeTotal,
    required this.poisonCounters,
  });

  Player copyWith({String? name, int? lifeTotal, int? poisonCounters}) => Player(
        id: id,
        name: name ?? this.name,
        lifeTotal: lifeTotal ?? this.lifeTotal,
        poisonCounters: poisonCounters ?? this.poisonCounters,
      );

  bool defeatedIn(FormatConfig format) =>
      lifeTotal <= 0 || poisonCounters >= format.poisonLethal;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'lifeTotal': lifeTotal,
        'poisonCounters': poisonCounters,
      };

  factory Player.fromJson(Map<String, dynamic> json) => Player(
        id: json['id'] as int,
        name: json['name'] as String,
        lifeTotal: json['lifeTotal'] as int,
        poisonCounters: json['poisonCounters'] as int,
      );
}

enum MoveKind { life, poison }

class Move {
  final int playerId;
  final MoveKind kind;
  final int delta;
  final int at;

  const Move({required this.playerId, required this.kind, required this.delta, required this.at});

  Map<String, dynamic> toJson() => {
        'playerId': playerId,
        'kind': kind == MoveKind.life ? 'life' : 'poison',
        'delta': delta,
        'at': at,
      };

  factory Move.fromJson(Map<String, dynamic> json) => Move(
        playerId: json['playerId'] as int,
        kind: json['kind'] == 'poison' ? MoveKind.poison : MoveKind.life,
        delta: json['delta'] as int,
        at: json['at'] as int,
      );
}

const int kMaxHistory = 10;

class GameState {
  final GameMode mode;
  final FormatConfig format;
  final List<Player> players;
  final List<Move> history;
  final int createdAt;

  const GameState({
    required this.mode,
    required this.format,
    required this.players,
    required this.history,
    required this.createdAt,
  });

  factory GameState.create({
    GameMode mode = GameMode.oneVOne,
    FormatConfig format = Formats.standard,
    List<String> names = const [],
  }) {
    final count = mode.playerCount;
    final players = List<Player>.generate(count, (i) {
      final raw = i < names.length ? names[i].trim() : '';
      return Player(
        id: i + 1,
        name: raw.isEmpty ? 'Player ${i + 1}' : raw,
        lifeTotal: format.startingLife,
        poisonCounters: 0,
      );
    });
    return GameState(
      mode: mode,
      format: format,
      players: players,
      history: const [],
      createdAt: DateTime.now().millisecondsSinceEpoch,
    );
  }

  GameState _withPlayers(List<Player> players, {Move? pushed}) {
    final nextHistory = pushed == null
        ? history
        : [...history, pushed].let((h) => h.length > kMaxHistory ? h.sublist(h.length - kMaxHistory) : h);
    return GameState(
      mode: mode,
      format: format,
      players: players,
      history: nextHistory,
      createdAt: createdAt,
    );
  }

  GameState adjustLife(int playerId, int delta) {
    if (delta == 0) return this;
    final next = players
        .map((p) => p.id == playerId ? p.copyWith(lifeTotal: p.lifeTotal + delta) : p)
        .toList();
    return _withPlayers(
      next,
      pushed: Move(
        playerId: playerId,
        kind: MoveKind.life,
        delta: delta,
        at: DateTime.now().millisecondsSinceEpoch,
      ),
    );
  }

  GameState adjustPoison(int playerId, int delta) {
    if (delta == 0) return this;
    final next = players.map((p) {
      if (p.id != playerId) return p;
      final val = p.poisonCounters + delta;
      return p.copyWith(poisonCounters: val < 0 ? 0 : val);
    }).toList();
    return _withPlayers(
      next,
      pushed: Move(
        playerId: playerId,
        kind: MoveKind.poison,
        delta: delta,
        at: DateTime.now().millisecondsSinceEpoch,
      ),
    );
  }

  GameState undo() {
    if (history.isEmpty) return this;
    final last = history.last;
    final remaining = history.sublist(0, history.length - 1);
    final next = players.map((p) {
      if (p.id != last.playerId) return p;
      if (last.kind == MoveKind.life) {
        return p.copyWith(lifeTotal: p.lifeTotal - last.delta);
      }
      final val = p.poisonCounters - last.delta;
      return p.copyWith(poisonCounters: val < 0 ? 0 : val);
    }).toList();
    return GameState(
      mode: mode,
      format: format,
      players: next,
      history: remaining,
      createdAt: createdAt,
    );
  }

  GameState reset() => GameState.create(
        mode: mode,
        format: format,
        names: players.map((p) => p.name).toList(),
      );

  Map<String, dynamic> toJson() => {
        'mode': mode.serialized,
        'format': format.toJson(),
        'players': players.map((p) => p.toJson()).toList(),
        'history': history.map((m) => m.toJson()).toList(),
        'createdAt': createdAt,
      };

  String serialize() => jsonEncode(toJson());

  static GameState? deserialize(String raw) {
    try {
      final json = jsonDecode(raw) as Map<String, dynamic>;
      return GameState(
        mode: GameModeX.fromSerialized(json['mode'] as String? ?? '1v1'),
        format: FormatConfig.fromJson(json['format'] as Map<String, dynamic>),
        players: (json['players'] as List)
            .cast<Map<String, dynamic>>()
            .map(Player.fromJson)
            .toList(),
        history: (json['history'] as List)
            .cast<Map<String, dynamic>>()
            .map(Move.fromJson)
            .toList(),
        createdAt: json['createdAt'] as int,
      );
    } catch (_) {
      return null;
    }
  }
}

extension _ListLet<T> on List<T> {
  R let<R>(R Function(List<T>) fn) => fn(this);
}
