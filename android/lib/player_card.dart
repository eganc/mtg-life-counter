import 'package:flutter/material.dart';
import 'game_state.dart';

class PlayerCard extends StatelessWidget {
  final Player player;
  final FormatConfig format;
  final Color accent;
  final void Function(int delta) onLife;
  final void Function(int delta) onPoison;

  const PlayerCard({
    super.key,
    required this.player,
    required this.format,
    required this.accent,
    required this.onLife,
    required this.onPoison,
  });

  static const _lifeDeltas = [-10, -5, -1, 1, 5, 10];

  @override
  Widget build(BuildContext context) {
    final dead = player.defeatedIn(format);
    return Container(
      margin: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: accent.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: accent.withValues(alpha: 0.5)),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  player.name,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (dead)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.red.withValues(alpha: 0.25),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: const Text(
                    'DEFEATED',
                    style: TextStyle(color: Color(0xFFFCA5A5), fontSize: 11, letterSpacing: 1),
                  ),
                ),
            ],
          ),
          Expanded(
            child: Center(
              child: FittedBox(
                child: Text(
                  '${player.lifeTotal}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 96,
                    fontWeight: FontWeight.bold,
                    fontFeatures: [FontFeature.tabularFigures()],
                  ),
                ),
              ),
            ),
          ),
          GridView.count(
            crossAxisCount: 6,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            childAspectRatio: 1.3,
            children: _lifeDeltas
                .map((d) => _DeltaButton(
                      label: d > 0 ? '+$d' : '$d',
                      onPressed: () => onLife(d),
                    ))
                .toList(),
          ),
          const SizedBox(height: 10),
          Container(
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(10),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            child: Row(
              children: [
                const Icon(Icons.whatshot, color: Color(0xFF4ADE80), size: 18),
                const SizedBox(width: 6),
                const Text('Poison', style: TextStyle(color: Colors.white70)),
                const SizedBox(width: 8),
                Text(
                  '${player.poisonCounters} / ${format.poisonLethal}',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
                ),
                const Spacer(),
                _SmallButton(label: '−', onPressed: () => onPoison(-1)),
                const SizedBox(width: 6),
                _SmallButton(
                  label: '+',
                  onPressed: () => onPoison(1),
                  filled: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DeltaButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  const _DeltaButton({required this.label, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    return FilledButton.tonal(
      onPressed: onPressed,
      style: FilledButton.styleFrom(
        padding: EdgeInsets.zero,
        backgroundColor: const Color(0xFF1E293B),
        foregroundColor: Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
      child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
    );
  }
}

class _SmallButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool filled;
  const _SmallButton({required this.label, required this.onPressed, this.filled = false});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 40,
      height: 40,
      child: FilledButton(
        onPressed: onPressed,
        style: FilledButton.styleFrom(
          padding: EdgeInsets.zero,
          backgroundColor: filled ? const Color(0xFF15803D) : const Color(0xFF334155),
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        ),
        child: Text(label, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
