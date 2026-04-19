import { useCallback, useEffect, useState } from 'react';
import {
  adjustLife,
  adjustPoison,
  createGame,
  deserialize,
  resetGame,
  serialize,
  undo,
  type FormatConfig,
  type GameMode,
  type GameState,
} from '@mtg/shared';

const STORAGE_KEY = 'mtg-life-counter/v1';

function loadInitial(): GameState {
  if (typeof window === 'undefined') return createGame();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return createGame();
  return deserialize(raw) ?? createGame();
}

export function useGameState() {
  const [state, setState] = useState<GameState>(loadInitial);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, serialize(state));
  }, [state]);

  const startGame = useCallback((mode: GameMode, format: FormatConfig, names: string[] = []) => {
    setState(createGame(mode, format, names));
  }, []);

  const life = useCallback((id: number, delta: number) => {
    setState((s) => adjustLife(s, id, delta));
  }, []);

  const poison = useCallback((id: number, delta: number) => {
    setState((s) => adjustPoison(s, id, delta));
  }, []);

  const undoMove = useCallback(() => setState((s) => undo(s)), []);
  const reset = useCallback(() => setState((s) => resetGame(s)), []);

  return { state, startGame, life, poison, undo: undoMove, reset };
}
