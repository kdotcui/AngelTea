export type TileState = 'hidden' | 'revealed-safe' | 'revealed-mine';

export interface Tile {
  id: number;
  state: TileState;
  isMine: boolean;
}

export interface MinesGameState {
  tiles: Tile[];
  minesCount: number;
  revealedCount: number;
  gameStatus: 'idle' | 'playing' | 'won' | 'lost';
  currentMultiplier: number;
  prize: MinesPrize | null;
}

export interface MinesPrize {
  id: string;
  type: string;
  label: string;
  value: string;
  multiplier: number;
}

