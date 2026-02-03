export type LobbyStatus = "lobby" | "playing" | "finished";


export type Player = {
  id: string;
  name: string;
  color: string;
  score: number;
  x: number;
  y: number;
  isHost: boolean;
  isReady: boolean;
  connected: boolean;
};

export type LobbySettings = {
  gridWidth: number;
  gridHeight: number;
  sweetCount: number;
  matchDurationSec: number;
  tickRate: number;
};

export type Lobby = {
  code: string;
  players: Player[];
  status: "lobby" | "playing" | "finished";
  settings: LobbySettings;
};

export type Position = { x: number; y: number };

export type GameState = {
  gridWidth: number;
  gridHeight: number;
  players: Record<string, Player>;
  sweets: Position[];
  remainingTime: number;
  matchDurationSec: number;
  startedAt: number;
};
export type Direction = "up" | "down" | "left" | "right";