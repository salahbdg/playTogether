import { Lobby, Player, LobbySettings } from "@/lib/shared";


const lobbies = new Map<string, Lobby>();

const DEFAULT_SETTINGS: LobbySettings = {
  gridWidth: 20,
  gridHeight: 20,
  sweetCount: 5,
  matchDurationSec: 60,
  tickRate: 10,
};

const PLAYER_COLORS = [
  "#e74c3c", // red
  "#3498db", // blue
  "#2ecc71", // green
  "#f1c40f", // yellow
  "#9b59b6", // purple
  "#e67e22", // orange
  "#1abc9c", // turquoise
  "#34495e", // dark blue
  "#f39c12", // gold
  "#e74c3c", // crimson
  "#c0392b", // dark red
  "#16a085", // dark turquoise
  "#27ae60", // dark green
  "#2980b9", // dark blue
  "#8e44ad", // dark purple
  "#d35400", // dark orange
  "#c23b22", // burnt red
  "#a93226", // maroon
  "#76d7c4", // mint
  "#f8b88b", // peach
  "#aa96da", // lavender
  "#fcbad3", // pink
  "#a8dadc", // light blue
  "#457b9d", // slate blue
  "#1d3557", // navy
  "#f1faee", // off white
  "#e63946", // red accent
  "#ff6b6b", // coral
  "#4ecdc4", // teal
  "#45b7d1", // sky blue
  "#ffa502", // vibrant orange
  "#ff006e", // hot pink
  "#8338ec", // vibrant purple
  "#ffbe0b", // bright yellow
  "#fb5607", // orange red
  "#ffbe0b", // golden yellow
  "#05ffa1", // neon green
  "#00d9ff", // cyan
  // add more colors as needed
];

function getNextColor(players: Player[]) {
  const used = new Set(players.map(p => p.color));
  return PLAYER_COLORS.find(c => !used.has(c)) ?? "#000000"; // default to black if all colors used
}


function getRandomColor(): string {
  return PLAYER_COLORS[Math.floor(Math.random() * PLAYER_COLORS.length)];
}


function generateLobbyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function createPlayer(params: {
  id: string;
  name: string;
  isHost: boolean;
  existingPlayers?: Player[];
}): Player {
  return {
    id: params.id,
    name: params.name,
    color: getNextColor(params.existingPlayers ?? []),
    score: 0,
    x: 0,
    y: 0,
    isHost: params.isHost,
    isReady: false,
    connected: true,
  };
}

/* ---------------- Public API ---------------- */

export function createLobby(hostId: string, hostName: string): Lobby {
  let code: string;
  do {
    code = generateLobbyCode();
  } while (lobbies.has(code));

  const host = createPlayer({
    id: hostId,
    name: hostName,
    isHost: true,
    existingPlayers: [],
  });

  const lobby: Lobby = {
    code,
    status: "lobby",
    players: [host],
    settings: { ...DEFAULT_SETTINGS },
  };

  lobbies.set(code, lobby);
  return lobby;
}

export function getLobby(code: string): Lobby | undefined {
  return lobbies.get(code);
}

export function joinLobby(
  code: string,
  playerId: string,
  playerName: string
): Lobby {
  const lobby = lobbies.get(code);
  if (!lobby) {
    throw new Error("Lobby not found");
  }

  if (lobby.players.some((p) => p.id === playerId)) {
    return lobby;
  }

  const player = createPlayer({
    id: playerId,
    name: playerName,
    isHost: false,
    existingPlayers: lobby.players,

  });

  lobby.players.push(player);
  return lobby;
}

export function leaveLobby(code: string, playerId: string): Lobby | undefined {
  const lobby = lobbies.get(code);
  if (!lobby) return;

  lobby.players = lobby.players.filter((p) => p.id !== playerId);

  if (lobby.players.length === 0) {
    lobbies.delete(code);
    return;
  }

  // Reassign host if needed
  if (!lobby.players.some((p) => p.isHost)) {
    lobby.players[0].isHost = true;
  }

  return lobby;
}


/* ---------------- Helper: find lobby by socket/player id ---------------- */
export function getLobbyBySocket(socketId: string): Lobby | undefined {
  for (const lobby of lobbies.values()) {
    if (lobby.players.some((p) => p.id === socketId)) {
      return lobby;
    }
  }
  return undefined;
}

/* Optional: get all lobby codes */
export function getAllLobbyCodes(): string[] {
  return Array.from(lobbies.keys());
}