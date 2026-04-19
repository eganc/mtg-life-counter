import { useMemo, useState } from 'react';
import {
  FORMATS,
  customFormat,
  type FormatConfig,
  type FormatPreset,
  type GameMode,
} from '@mtg/shared';

interface Props {
  onStart: (mode: GameMode, format: FormatConfig, names: string[]) => void;
  onCancel?: () => void;
}

const MODES: { id: GameMode; label: string; count: number }[] = [
  { id: '1v1', label: '1v1', count: 2 },
  { id: '3p', label: '3 Players', count: 3 },
  { id: '4p', label: '4 Players', count: 4 },
];

export function GameSetup({ onStart, onCancel }: Props) {
  const [mode, setMode] = useState<GameMode>('1v1');
  const [preset, setPreset] = useState<FormatPreset>('standard');
  const [customLife, setCustomLife] = useState(20);
  const [names, setNames] = useState<string[]>(['', '', '', '']);

  const count = MODES.find((m) => m.id === mode)!.count;
  const format: FormatConfig = useMemo(
    () => (preset === 'custom' ? customFormat(customLife) : FORMATS[preset]),
    [preset, customLife],
  );

  return (
    <div className="max-w-xl mx-auto p-6 flex flex-col gap-6">
      <header className="text-center">
        <h1 className="font-display text-4xl font-bold">MTG Life Counter</h1>
        <p className="text-slate-400 text-sm mt-1">Pick a mode and format to begin.</p>
      </header>

      <section className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wider text-slate-400">Mode</label>
        <div className="grid grid-cols-3 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`py-3 rounded-lg font-semibold transition ${
                mode === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wider text-slate-400">Format</label>
        <div className="grid grid-cols-2 gap-2">
          {(['standard', 'commander', 'twoHeadedGiant', 'custom'] as FormatPreset[]).map((p) => (
            <button
              key={p}
              onClick={() => setPreset(p)}
              className={`py-3 px-3 rounded-lg text-sm font-semibold transition ${
                preset === p ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              {p === 'custom' ? 'Custom' : FORMATS[p].label}
              <span className="block text-[11px] font-normal opacity-75">
                {p === 'custom' ? `${customLife} life` : `${FORMATS[p].startingLife} life`}
              </span>
            </button>
          ))}
        </div>
        {preset === 'custom' && (
          <input
            type="number"
            min={1}
            max={999}
            value={customLife}
            onChange={(e) => setCustomLife(Math.max(1, Number(e.target.value) || 1))}
            className="mt-2 w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
            aria-label="Custom starting life"
          />
        )}
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs uppercase tracking-wider text-slate-400">
          Player names (optional)
        </label>
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: count }, (_, i) => (
            <input
              key={i}
              value={names[i]}
              onChange={(e) =>
                setNames((prev) => prev.map((n, j) => (j === i ? e.target.value : n)))
              }
              placeholder={`Player ${i + 1}`}
              className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700"
            />
          ))}
        </div>
      </section>

      <div className="flex gap-2">
        {onCancel && (
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 font-semibold"
          >
            Cancel
          </button>
        )}
        <button
          onClick={() => onStart(mode, format, names.slice(0, count))}
          className="flex-1 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
