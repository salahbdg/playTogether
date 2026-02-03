import type {
  GameState,
  Lobby,
  Player,
  Position,
  Direction,
} from "@/lib/shared/types";
import type { Server } from "socket.io";

/* ---------------- Game storage ---------------- */
const games = new Map<string, GameState>();
const gameIntervals = new Map<string, NodeJS.Timeout>();

/* ---------------- Socket.IO reference ---------------- */
let io: Server<any, any> | null = null;
export function attachIO(socketServer: Server<any, any>) {
  io = socketServer;
}

/* ---------------- Utils ---------------- */
function getRandomEmptyPosition(state: GameState): Position {
  let pos: Position;
  do {
    pos = {
      x: Math.floor(Math.random() * state.gridWidth),
      y: Math.floor(Math.random() * state.gridHeight),
    };
  } while (
    Object.values(state.players).some((p) => p.x === pos.x && p.y === pos.y) ||
    state.sweets.some((s) => s.x === pos.x && s.y === pos.y)
  );
  return pos;
}

function spawnSweets(state: GameState, count: number) {
  for (let i = 0; i < count; i++) {
    state.sweets.push(getRandomEmptyPosition(state));
  }
}

/* ---------------- Movement ---------------- */
function movePlayer(player: Player, dir: Direction, state: GameState) {
  let { x, y } = player;

  switch (dir) {
    case "up":
      y = Math.max(0, y - 1);
      break;
    case "down":
      y = Math.min(state.gridHeight - 1, y + 1);
      break;
    case "left":
      x = Math.max(0, x - 1);
      break;
    case "right":
      x = Math.min(state.gridWidth - 1, x + 1);
      break;
  }

  player.x = x;
  player.y = y;

  // Check for sweets collision
  const sweetIndex = state.sweets.findIndex((s) => s.x === x && s.y === y);
  if (sweetIndex !== -1) {
    player.score += 1;
    state.sweets.splice(sweetIndex, 1);
  }
}

/* ---------------- Public API ---------------- */
export function startGame(lobby: Lobby) {
  if (games.has(lobby.code)) return games.get(lobby.code);

  const state: GameState = {
    gridWidth: lobby.settings.gridWidth,
    gridHeight: lobby.settings.gridHeight,
    players: {},
    sweets: [],
    remainingTime: lobby.settings.matchDurationSec,
    matchDurationSec: lobby.settings.matchDurationSec, // new: total match duration
    startedAt: Date.now(),
  };

  // Place players at random positions
  lobby.players.forEach((p) => {
    const pos = getRandomEmptyPosition(state);
    state.players[p.id] = { ...p, x: pos.x, y: pos.y, score: 0 };
  });

  // Spawn sweets
  spawnSweets(state, lobby.settings.sweetCount);

  games.set(lobby.code, state);

  // Start tick loop
  const interval = setInterval(
    () => tick(lobby.code, lobby.settings.tickRate),
    1000 / lobby.settings.tickRate,
  );
  gameIntervals.set(lobby.code, interval);

  return state;
}

export function getGameState(code: string) {
  return games.get(code);
}

export function removeGame(code: string) {
  games.delete(code);
  const interval = gameIntervals.get(code);
  if (interval) clearInterval(interval);
  gameIntervals.delete(code);
}

/* ---------------- Tick ---------------- */
function tick(code: string, tickRate: number) {
  const state = games.get(code);
  if (!state || !io) return;

  // Compute remaining time in real seconds
  const elapsed = (Date.now() - state.startedAt) / 1000;
  state.remainingTime = Math.max(0, state.matchDurationSec - elapsed);

  // Game ends
  if (state.remainingTime <= 0) {
    const results = computeResults(state.players);

    io.to(code).emit("game:finished", results);
    removeGame(code);
    return;
  }

  // Broadcast current game state
  io.to(code).emit("game:state", state);
}

/* ---------------- Player input ---------------- */
export function handlePlayerInput(
  code: string,
  playerId: string,
  dir: Direction,
) {
  const state = games.get(code);
  if (!state) return;

  const player = state.players[playerId];
  if (!player) return;

  movePlayer(player, dir, state);
}

function computeResults(players: Record<string, Player>) {
  const list = Object.values(players);

  const maxScore = Math.max(...list.map((p) => p.score));
  const winners = list.filter((p) => p.score === maxScore);

  return {
    players: list.sort((a, b) => b.score - a.score),
    winners,
    maxScore,
  };
}
