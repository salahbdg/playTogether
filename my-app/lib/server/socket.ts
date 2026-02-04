import { Server as IOServer, Socket } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents } from "@/lib/shared";
import {
  createLobby,
  joinLobby,
  leaveLobby,
  getLobby,
  getLobbyBySocket,
} from "@/lib/server/lobby/lobbyManager";

import {
  startGame,
  handlePlayerInput,
  getGameState,
  attachIO,
} from "@/lib/server/game/gameManager";

/* ---------------- Single io instance ---------------- */
let io: IOServer<ClientToServerEvents, ServerToClientEvents>;

/* ---------------- Server initialization ---------------- */
export function initSocketServer(httpServer: any) {
  if (io) return io;

  io = new IOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/socket.io",
    cors: { origin: "*" },
  });

  attachIO(io); // we attach io to gameManager for tick broadcasting

  io.on(
    "connection",
    (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
      console.log("Socket connected:", socket.id);

      /* ---------- Lobby: create ---------- */
      socket.on("lobby:create", (payload) => {
        const { name } = payload;
        try {
          const lobby = createLobby(socket.id, name);
          socket.join(lobby.code);
          io.to(lobby.code).emit("lobby:state", { lobby });
          console.log(`Lobby ${lobby.code} created by ${name}`);
        } catch (err) {
          console.error("Error creating lobby:", err);
        }
      });

      /* ---------- Lobby: join ---------- */
      socket.on("lobby:join", (payload) => {
        const { code, name } = payload;
        try {
          const lobby = joinLobby(code, socket.id, name);
          socket.join(lobby.code);
          io.to(lobby.code).emit("lobby:state", { lobby });
          console.log(`${name} joined lobby ${code}`);
        } catch (err) {
          console.error("Error joining lobby:", err);
        }
      });

      /* ---------- Lobby: leave ---------- */
      socket.on("lobby:leave", () => {
        handleLeave(socket);
      });

      /* ---------- Disconnect ---------- */
      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        handleLeave(socket);
      });

      socket.on("game:start", () => {
        const lobby = getLobbyBySocket(socket.id); // Implement helper to get lobby
        if (!lobby) return;
        lobby.status = "playing";
        const state = startGame(lobby);
        io.to(lobby.code).emit("game:state", state);
      });

      socket.on("game:input", ({ dir }) => {
        console.log("Input received:", socket.id, dir);

        const lobby = getLobbyBySocket(socket.id);
        if (!lobby) {
          console.log("No lobby found for socket", socket.id);
          return;
        }
        if (!lobby) return;
        handlePlayerInput(lobby.code, socket.id, dir);
        const state = getGameState(lobby.code);
        if (state) io.to(lobby.code).emit("game:state", state);
      });
    },
  );

  return io;
}

/* ---------------- Helper: leave and broadcast ---------------- */
function handleLeave(
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
) {
  // Find the first lobby the socket belongs to
  const lobby = Array.from(socket.rooms)
    .map((room) => getLobby(room))
    .find(Boolean);

  if (!lobby) return;

  const updated = leaveLobby(lobby.code, socket.id);
  socket.leave(lobby.code);

  if (updated) {
    io.to(updated.code).emit("lobby:state", { lobby: updated });
  }
}
