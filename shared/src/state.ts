import type { FormatConfig, GameMode, GameState, Move, Player } from './types.js';
import { DEFAULT_FORMAT } from './presets.js';

export const MAX_HISTORY = 10;

const PLAYER_COUNT: Record<GameMode, number> = { '1v1': 2, '3p': 3, '4p': 4 };

export function createGame(
  mode: GameMode = '1v1',
  format: FormatConfig = DEFAULT_FORMAT,
  names: string[] = [],
): GameState {
  const count = PLAYER_COUNT[mode];
  const players: Player[] = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: names[i]?.trim() || `Player ${i + 1}`,
    lifeTotal: format.startingLife,
    poisonCounters: 0,
  }));
  return { mode, format, players, history: [], createdAt: Date.now() };
}

function pushHistory(state: GameState, move: Move): Move[] {
  const next = [...state.history, move];
  return next.length > MAX_HISTORY ? next.slice(next.length - MAX_HISTORY) : next;
}

function mapPlayer(state: GameState, id: number, fn: (p: Player) => Player): Player[] {
  return state.players.map((p) => (p.id === id ? fn(p) : p));
}

export function adjustLife(state: GameState, playerId: number, delta: number): GameState {
  if (delta === 0) return state;
  return {
    ...state,
    players: mapPlayer(state, playerId, (p) => ({ ...p, lifeTotal: p.lifeTotal + delta })),
    history: pushHistory(state, { playerId, kind: 'life', delta, at: Date.now() }),
  };
}

export function adjustPoison(state: GameState, playerId: number, delta: number): GameState {
  if (delta === 0) return state;
  return {
    ...state,
    players: mapPlayer(state, playerId, (p) => ({
      ...p,
      poisonCounters: Math.max(0, p.poisonCounters + delta),
    })),
    history: pushHistory(state, { playerId, kind: 'poison', delta, at: Date.now() }),
  };
}

export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const last = state.history[state.history.length - 1];
  const history = state.history.slice(0, -1);
  const players = mapPlayer(state, last.playerId, (p) =>
    last.kind === 'life'
      ? { ...p, lifeTotal: p.lifeTotal - last.delta }
      : { ...p, poisonCounters: Math.max(0, p.poisonCounters - last.delta) },
  );
  return { ...state, players, history };
}

export function resetGame(state: GameState): GameState {
  return createGame(
    state.mode,
    state.format,
    state.players.map((p) => p.name),
  );
}

export function isDefeated(player: Player, format: FormatConfig): boolean {
  return player.lifeTotal <= 0 || player.poisonCounters >= format.poisonLethal;
}

export function serialize(state: GameState): string {
  return JSON.stringify(state);
}

export function deserialize(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as GameState;
    if (!parsed?.players || !Array.isArray(parsed.players)) return null;
    return parsed;
  } catch {
    return null;
  }
}
