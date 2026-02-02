export type Position = {
  x: number;
  y: number;
};

export type Player = {
  id: string;
  x: number;
  y: number;
  score: number;
};

export type GameStatus = 'playing' | 'finished';

export type GameState = {
  code: string;
  gridWidth: number;
  gridHeight: number;
  sweets: Position[];
  player: Player;
  status: GameStatus;
};
