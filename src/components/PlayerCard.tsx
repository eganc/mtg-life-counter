import { useRef, useState, useEffect } from 'react';
import { isDefeated, type FormatConfig, type Player } from '../shared';

interface Props {
  player: Player;
  format: FormatConfig;
  onLife: (delta: number) => void;
  onPoison: (delta: number) => void;
  accent: string;
  rotation?: 0 | 90 | 180 | 270;
  className?: string;
}

const QUICK_DELTAS = [-10, -5, +5, +10];

export function PlayerCard({ player, format, onLife, onPoison, accent, rotation = 0, className = 'flex-1 min-h-0' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const needs90 = rotation === 90 || rotation === 270;
  const dead = isDefeated(player, format);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ w: width, h: height });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // For 90/270 rotations: swap w/h so the content fills the container after rotating.
  // For 0/180: simple rotate on an inset-0 div.
  const innerStyle: React.CSSProperties =
    needs90 && size.w > 0
      ? {
          position: 'absolute',
          width: `${size.h}px`,
          height: `${size.w}px`,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        }
      : {
          position: 'absolute',
          inset: 0,
          transform: `rotate(${rotation}deg)`,
        };

  return (
    <div
      ref={containerRef}
      className={`${className} relative rounded-2xl border ${accent} shadow-lg overflow-hidden`}
    >
      <div style={innerStyle} className="flex flex-col p-3 gap-2">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <h2 className="text-sm font-semibold truncate">{player.name}</h2>
          {dead && (
            <span className="text-xs uppercase tracking-wider bg-red-500/20 text-red-300 px-2 py-0.5 rounded">
              Defeated
            </span>
          )}
        </div>

        {/* Life total with big ±1 tap zones */}
        <div className="flex-1 flex items-stretch min-h-0">
          <button
            onClick={() => onLife(-1)}
            className="flex-1 flex items-center justify-center text-5xl font-thin text-slate-600 hover:text-slate-200 hover:bg-rose-950/50 active:bg-rose-950/80 rounded-xl transition select-none"
            aria-label="-1 life"
          >
            −
          </button>
          <div className="flex items-center justify-center px-2 shrink-0 pointer-events-none">
            <span className="font-display text-6xl sm:text-7xl font-bold tabular-nums">
              {player.lifeTotal}
            </span>
          </div>
          <button
            onClick={() => onLife(+1)}
            className="flex-1 flex items-center justify-center text-5xl font-thin text-slate-600 hover:text-slate-200 hover:bg-emerald-950/50 active:bg-emerald-950/80 rounded-xl transition select-none"
            aria-label="+1 life"
          >
            +
          </button>
        </div>

        {/* ±5 / ±10 quick buttons — hidden in compact (sideways) mode */}
        {!needs90 && (
          <div className="grid grid-cols-4 gap-1.5 shrink-0">
            {QUICK_DELTAS.map((d) => (
              <button
                key={d}
                onClick={() => onLife(d)}
                className="py-2.5 rounded-lg bg-slate-800/70 hover:bg-slate-700 active:scale-95 transition font-semibold text-sm"
              >
                {d > 0 ? `+${d}` : d}
              </button>
            ))}
          </div>
        )}

        {/* Poison counter */}
        <div className="flex items-center justify-between bg-slate-800/40 rounded-lg px-2 py-1.5 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-green-400" aria-hidden>
              ☠
            </span>
            {!needs90 && <span className="text-xs text-slate-300">Poison</span>}
            <span className="tabular-nums font-semibold text-sm">
              {player.poisonCounters}
              <span className="text-slate-500">/{format.poisonLethal}</span>
            </span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => onPoison(-1)}
              className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-slate-600 active:scale-95 font-bold text-sm"
              aria-label="Decrement poison"
            >
              −
            </button>
            <button
              onClick={() => onPoison(+1)}
              className="w-8 h-8 rounded-lg bg-green-700 hover:bg-green-600 active:scale-95 font-bold text-sm"
              aria-label="Increment poison"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
