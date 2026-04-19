export interface Player {
  id: number;
  name: string;
  lifeTotal: number;
  poisonCounters: number;
}

export type GameMode = '1v1' | '3p' | '4p';

export type FormatPreset = 'standard' | 'commander' | 'twoHeadedGiant' | 'custom';

export interface FormatConfig {
  id: FormatPreset;
  label: string;
  startingLife: number;
  poisonLethal: number;
}

export type MoveKind = 'life' | 'poison';

export interface Move {
  playerId: number;
  kind: MoveKind;
  delta: number;
  at: number;
}

export interface GameState {
  mode: GameMode;
  format: FormatConfig;
  players: Player[];
  history: Move[];
  createdAt: number;
}
