import { useState } from 'react';
import { PlayerCard } from './components/PlayerCard';
import { GameSetup } from './components/GameSetup';
import { useGameState } from './hooks/useGameState';
import type { Player } from '@mtg/shared';

const ACCENTS = [
  'border-rose-500/40 bg-rose-950/30',
  'border-sky-500/40 bg-sky-950/30',
  'border-amber-500/40 bg-amber-950/30',
  'border-emerald-500/40 bg-emerald-950/30',
];

// Rotation per player index, per mode.
// 1v1:  P0=top (180°, faces across table), P1=bottom (0°, normal)
// 3p:   P0=top (180°), P1=bottom-left (270°), P2=bottom-right (90°)
// 4p:   P0=top-left (180°), P1=top-right (270°), P2=bottom-left (90°), P3=bottom-right (0°)
const ROTATIONS: Record<string, (0 | 90 | 180 | 270)[]> = {
  '1v1': [180, 0],
  '3p': [180, 270, 90],
  '4p': [180, 270, 90, 0],
};

export default function App() {
  const { state, startGame, life, poison, undo, reset } = useGameState();
  const [setupOpen, setSetupOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  if (setupOpen) {
    return (
      <GameSetup
        onStart={(mode, format, names) => {
          startGame(mode, format, names);
          setSetupOpen(false);
        }}
        onCancel={() => setSetupOpen(false)}
      />
    );
  }

  const { players, mode } = state;
  const rotations = ROTATIONS[mode] ?? players.map(() => 0 as const);

  function card(p: Player, i: number) {
    return (
      <PlayerCard
        key={p.id}
        player={p}
        format={state.format}
        onLife={(d) => life(p.id, d)}
        onPoison={(d) => poison(p.id, d)}
        accent={ACCENTS[i % ACCENTS.length]}
        rotation={rotations[i]}
      />
    );
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/80 backdrop-blur shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-bold">MTG Life</span>
          <span className="text-xs text-slate-400 uppercase tracking-wider">
            {state.mode} · {state.format.label} · {state.format.startingLife} life
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={undo}
            disabled={state.history.length === 0}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
          >
            Undo ({state.history.length})
          </button>
          <button
            onClick={() => setHistoryOpen((v) => !v)}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 hover:bg-slate-700"
          >
            History
          </button>
          <button
            onClick={reset}
            className="px-3 py-1.5 text-sm rounded-md bg-slate-800 hover:bg-slate-700"
          >
            Reset
          </button>
          <button
            onClick={() => setSetupOpen(true)}
            className="px-3 py-1.5 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500"
          >
            New Game
          </button>
        </div>
      </header>

      {/* ── 1v1: two stacked cards, opposite orientations ── */}
      {mode === '1v1' && (
        <main className="flex-1 min-h-0 flex flex-col p-3 gap-3">
          {card(players[0], 0)}
          {card(players[1], 1)}
        </main>
      )}

      {/* ── 3p: one on top (180°), two on bottom (270° / 90°) ── */}
      {mode === '3p' && (
        <main className="flex-1 min-h-0 flex flex-col p-3 gap-3">
          {card(players[0], 0)}
          <div className="flex-1 min-h-0 flex gap-3">
            {card(players[1], 1)}
            {card(players[2], 2)}
          </div>
        </main>
      )}

      {/* ── 4p: 2×2 grid, each corner rotated to face the center ── */}
      {mode === '4p' && (
        <main className="flex-1 min-h-0 grid grid-cols-2 grid-rows-2 p-3 gap-3">
          {players.map((p, i) => card(p, i))}
        </main>
      )}

      {historyOpen && (
        <aside className="fixed right-3 bottom-3 w-72 max-h-80 overflow-auto bg-slate-900 border border-slate-700 rounded-xl shadow-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">Recent moves</h3>
            <button
              onClick={() => setHistoryOpen(false)}
              className="text-slate-400 hover:text-slate-100 text-sm"
            >
              Close
            </button>
          </div>
          {state.history.length === 0 ? (
            <p className="text-sm text-slate-400">No moves yet.</p>
          ) : (
            <ol className="text-sm space-y-1">
              {[...state.history].reverse().map((m, i) => {
                const player = state.players.find((p) => p.id === m.playerId);
                return (
                  <li key={`${m.at}-${i}`} className="flex justify-between tabular-nums">
                    <span>
                      {player?.name ?? `P${m.playerId}`}{' '}
                      <span className="text-slate-400">
                        {m.kind === 'life' ? 'life' : 'poison'}
                      </span>
                    </span>
                    <span className={m.delta > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {m.delta > 0 ? `+${m.delta}` : m.delta}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      )}
    </div>
  );
}
