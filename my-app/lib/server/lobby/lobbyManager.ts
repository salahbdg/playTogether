import { Lobby, Player, LobbySettings } from "@/lib/shared";

const lobbies = new Map<string, Lobby>();

const DEFAULT_SETTINGS: LobbySettings = {
  gridWidth: 20,
  gridHeight: 20,
  sweetCount: 50,
  matchDurationSec: 60,
  tickRate: 10,
};

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
}): Player {
  return {
    id: params.id,
    name: params.name,
    color: "#000000", // placeholder
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