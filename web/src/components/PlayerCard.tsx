import { isDefeated, type FormatConfig, type Player } from '@mtg/shared';

interface Props {
  player: Player;
  format: FormatConfig;
  onLife: (delta: number) => void;
  onPoison: (delta: number) => void;
  accent: string;
}

const LIFE_DELTAS = [-10, -5, -1, +1, +5, +10];

export function PlayerCard({ player, format, onLife, onPoison, accent }: Props) {
  const dead = isDefeated(player, format);
  return (
    <div
      className={`flex-1 min-h-0 flex flex-col rounded-2xl border ${accent} p-4 gap-3 shadow-lg relative overflow-hidden`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold truncate">{player.name}</h2>
        {dead && (
          <span className="text-xs uppercase tracking-wider bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
            Defeated
          </span>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <span className="font-display text-7xl sm:text-8xl font-bold tabular-nums">
          {player.lifeTotal}
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {LIFE_DELTAS.map((d) => (
          <button
            key={d}
            onClick={() => onLife(d)}
            className="py-3 rounded-lg bg-slate-800/70 hover:bg-slate-700 active:scale-95 transition font-semibold"
          >
            {d > 0 ? `+${d}` : d}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between bg-slate-800/40 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="text-green-400" aria-hidden>
            ☠
          </span>
          <span className="text-sm text-slate-300">Poison</span>
          <span className="tabular-nums font-semibold">
            {player.poisonCounters}
            <span className="text-slate-500"> / {format.poisonLethal}</span>
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onPoison(-1)}
            className="w-10 h-10 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 font-bold"
            aria-label="Decrement poison"
          >
            −
          </button>
          <button
            onClick={() => onPoison(+1)}
            className="w-10 h-10 rounded-lg bg-green-700 hover:bg-green-600 active:scale-95 font-bold"
            aria-label="Increment poison"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
