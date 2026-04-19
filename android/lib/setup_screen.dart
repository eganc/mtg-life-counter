import 'package:flutter/material.dart';
import 'game_state.dart';

class SetupResult {
  final GameMode mode;
  final FormatConfig format;
  final List<String> names;
  const SetupResult(this.mode, this.format, this.names);
}

class SetupScreen extends StatefulWidget {
  const SetupScreen({super.key});

  @override
  State<SetupScreen> createState() => _SetupScreenState();
}

class _SetupScreenState extends State<SetupScreen> {
  GameMode _mode = GameMode.oneVOne;
  String _presetId = 'standard';
  int _customLife = 20;
  final List<TextEditingController> _names = List.generate(4, (_) => TextEditingController());

  @override
  void dispose() {
    for (final c in _names) {
      c.dispose();
    }
    super.dispose();
  }

  FormatConfig get _format {
    if (_presetId == 'custom') return Formats.custom(_customLife);
    return Formats.presets.firstWhere((f) => f.id == _presetId);
  }

  @override
  Widget build(BuildContext context) {
    final count = _mode.playerCount;
    return Scaffold(
      appBar: AppBar(title: const Text('New Game')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const _SectionLabel('Mode'),
            Row(
              children: GameMode.values
                  .map((m) => Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: _ChoiceChip(
                            label: m.label,
                            selected: _mode == m,
                            onTap: () => setState(() => _mode = m),
                          ),
                        ),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 20),
            const _SectionLabel('Format'),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final p in Formats.presets)
                  _ChoiceChip(
                    label: '${p.label} · ${p.startingLife}',
                    selected: _presetId == p.id,
                    onTap: () => setState(() => _presetId = p.id),
                  ),
                _ChoiceChip(
                  label: 'Custom · $_customLife',
                  selected: _presetId == 'custom',
                  onTap: () => setState(() => _presetId = 'custom'),
                ),
              ],
            ),
            if (_presetId == 'custom') ...[
              const SizedBox(height: 12),
              TextField(
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Starting life',
                  border: OutlineInputBorder(),
                ),
                controller: TextEditingController(text: _customLife.toString()),
                onChanged: (v) {
                  final n = int.tryParse(v);
                  if (n != null && n > 0) setState(() => _customLife = n);
                },
              ),
            ],
            const SizedBox(height: 20),
            const _SectionLabel('Player names (optional)'),
            for (int i = 0; i < count; i++)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: TextField(
                  controller: _names[i],
                  decoration: InputDecoration(
                    hintText: 'Player ${i + 1}',
                    border: const OutlineInputBorder(),
                  ),
                ),
              ),
            const SizedBox(height: 20),
            FilledButton(
              onPressed: () {
                final names = _names.take(count).map((c) => c.text).toList();
                Navigator.of(context).pop(SetupResult(_mode, _format, names));
              },
              style: FilledButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
              child: const Text('Start Game', style: TextStyle(fontSize: 16)),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        text.toUpperCase(),
        style: const TextStyle(
          color: Colors.white54,
          fontSize: 12,
          letterSpacing: 1.5,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _ChoiceChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;
  const _ChoiceChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return FilledButton(
      onPressed: onTap,
      style: FilledButton.styleFrom(
        backgroundColor: selected ? const Color(0xFF4F46E5) : const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      ),
      child: Text(label),
    );
  }
}
