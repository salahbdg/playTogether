import { Direction, Lobby, GameState } from "./types";

/* ---------- Client → Server ---------- */

export interface ClientToServerEvents {
  "lobby:create": { name: string };
  "lobby:join": { code: string; name: string };
  "lobby:leave": void;
  "lobby:ready": { ready: boolean };
  "game:start": void;
  "game:input": {
    dir: Direction;
    seq: number;
    clientTime: number;
  };
}

/* ---------- Server → Client ---------- */

export interface ServerToClientEvents {
  "lobby:state": { lobby: Lobby };
  "game:state": { gameState: GameState };
  "game:finished": {
    results: {
      playerId: string;
      name: string;
      score: number;
    }[];
  };
}
