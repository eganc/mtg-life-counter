import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'game_state.dart';
import 'player_card.dart';
import 'setup_screen.dart';

const String _storageKey = 'mtg-life-counter/v1';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final raw = prefs.getString(_storageKey);
  final initial = (raw != null ? GameState.deserialize(raw) : null) ?? GameState.create();
  runApp(MtgLifeApp(prefs: prefs, initial: initial));
}

class MtgLifeApp extends StatelessWidget {
  final SharedPreferences prefs;
  final GameState initial;
  const MtgLifeApp({super.key, required this.prefs, required this.initial});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MTG Life Counter',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5),
          brightness: Brightness.dark,
        ),
        scaffoldBackgroundColor: const Color(0xFF020617),
        useMaterial3: true,
      ),
      home: HomeScreen(prefs: prefs, initial: initial),
    );
  }
}

class HomeScreen extends StatefulWidget {
  final SharedPreferences prefs;
  final GameState initial;
  const HomeScreen({super.key, required this.prefs, required this.initial});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  late GameState _state = widget.initial;

  static const _accents = [
    Color(0xFFF43F5E),
    Color(0xFF0EA5E9),
    Color(0xFFF59E0B),
    Color(0xFF10B981),
  ];

  void _update(GameState Function(GameState) mutate) {
    setState(() => _state = mutate(_state));
    widget.prefs.setString(_storageKey, _state.serialize());
  }

  Future<void> _openSetup() async {
    final result = await Navigator.of(context).push<SetupResult>(
      MaterialPageRoute(builder: (_) => const SetupScreen()),
    );
    if (result != null) {
      _update((_) =>
          GameState.create(mode: result.mode, format: result.format, names: result.names));
    }
  }

  void _showHistory() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF0F172A),
      builder: (ctx) {
        if (_state.history.isEmpty) {
          return const Padding(
            padding: EdgeInsets.all(24),
            child: Text('No moves yet.', style: TextStyle(color: Colors.white70)),
          );
        }
        final reversed = _state.history.reversed.toList();
        return ListView.separated(
          padding: const EdgeInsets.symmetric(vertical: 12),
          itemCount: reversed.length,
          separatorBuilder: (_, i) => const Divider(height: 1, color: Color(0xFF1E293B)),
          itemBuilder: (_, i) {
            final m = reversed[i];
            final player = _state.players.firstWhere(
              (p) => p.id == m.playerId,
              orElse: () => Player(
                id: m.playerId,
                name: 'P${m.playerId}',
                lifeTotal: 0,
                poisonCounters: 0,
              ),
            );
            final deltaStr = m.delta > 0 ? '+${m.delta}' : '${m.delta}';
            return ListTile(
              dense: true,
              title: Text(player.name, style: const TextStyle(color: Colors.white)),
              subtitle: Text(
                m.kind == MoveKind.life ? 'life' : 'poison',
                style: const TextStyle(color: Colors.white54),
              ),
              trailing: Text(
                deltaStr,
                style: TextStyle(
                  color: m.delta > 0 ? const Color(0xFF34D399) : const Color(0xFFFB7185),
                  fontWeight: FontWeight.w600,
                ),
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final players = _state.players;
    final count = players.length;
    return Scaffold(
      appBar: AppBar(
        title: Text('${_state.mode.label} · ${_state.format.label}'),
        actions: [
          IconButton(
            tooltip: 'Undo',
            onPressed: _state.history.isEmpty ? null : () => _update((s) => s.undo()),
            icon: const Icon(Icons.undo),
          ),
          IconButton(
            tooltip: 'History',
            onPressed: _showHistory,
            icon: const Icon(Icons.history),
          ),
          IconButton(
            tooltip: 'Reset',
            onPressed: () => _update((s) => s.reset()),
            icon: const Icon(Icons.refresh),
          ),
          IconButton(
            tooltip: 'New game',
            onPressed: _openSetup,
            icon: const Icon(Icons.add_box_outlined),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          final landscape = constraints.maxWidth > constraints.maxHeight;
          final columns = count <= 2 ? (landscape ? 2 : 1) : 2;
          final rows = (count / columns).ceil();
          return Column(
            children: List.generate(rows, (r) {
              return Expanded(
                child: Row(
                  children: List.generate(columns, (c) {
                    final i = r * columns + c;
                    if (i >= count) return const Expanded(child: SizedBox.shrink());
                    final p = players[i];
                    return Expanded(
                      child: PlayerCard(
                        player: p,
                        format: _state.format,
                        accent: _accents[i % _accents.length],
                        onLife: (d) => _update((s) => s.adjustLife(p.id, d)),
                        onPoison: (d) => _update((s) => s.adjustPoison(p.id, d)),
                      ),
                    );
                  }),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
