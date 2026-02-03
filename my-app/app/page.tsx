"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type {
  ClientToServerEvents,
  ServerToClientEvents,
} from "@/lib/shared/events";
import GameGrid from "@/components/GameGrid";
import type { GameState, Lobby } from "@/lib/shared/types";

let socket: Socket<ClientToServerEvents, ServerToClientEvents>;

export default function Home() {
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);

  useEffect(() => {
    // Create socket once
    const s = io("http://localhost:3000");
    socket = s;

    socket.on("connect", () => console.log("Connected:", socket.id));

    socket.on("lobby:state", ({ lobby }) => setLobby(lobby));
    socket.on("game:state", (state) => setGameState(state));
    socket.on("game:finished", (results) => {
      console.log("Final results:", results);

      alert(
        results.winners.length === 1
          ? `Winner: ${results.winners[0].name}`
          : `Tie between: ${results.winners.map((w) => w.name).join(", ")}`,
      );

      setGameState(null);
    });

    // Keyboard input listener
    const handleKey = (e: KeyboardEvent) => {
      let dir: "up" | "down" | "left" | "right" | null = null;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dir = "up";
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dir = "down";
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dir = "left";
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dir = "right";
          break;
      }
      if (dir) {
        console.log("Sending input:", dir); // << debug log
        socket.emit("game:input", { dir });
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      socket.disconnect();
    };
  }, []); // empty dependency array ensures this runs only once

  const handleCreateLobby = () => {
    if (!name) return alert("Enter your name");
    socket.emit("lobby:create", { name });
  };

  const handleJoinLobby = () => {
    if (!name || !lobbyCode) return alert("Enter name and lobby code");
    socket.emit("lobby:join", { name, code: lobbyCode });
  };

  const handleStartGame = () => {
    socket.emit("game:start");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Multiplayer Game Test</h1>

      {/* Lobby controls */}
      <div className="space-x-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="border px-2 py-1"
        />
        <button
          onClick={handleCreateLobby}
          className="bg-green-500 text-white px-2 py-1"
        >
          Create Lobby
        </button>
      </div>
      <div className="space-x-2">
        <input
          value={lobbyCode}
          onChange={(e) => setLobbyCode(e.target.value)}
          placeholder="Lobby code"
          className="border px-2 py-1"
        />
        <button
          onClick={handleJoinLobby}
          className="bg-blue-500 text-white px-2 py-1"
        >
          Join Lobby
        </button>
      </div>

      {/* Lobby display */}
      {lobby && (
        <div className="border p-2">
          <h2 className="font-bold">
            Lobby {lobby.code} ({lobby.status})
          </h2>
          <ul>
            {gameState && (
              <div className="mt-4">
                <h3 className="font-bold">Scores</h3>
                <ul>
                  {Object.values(gameState.players).map((p) => (
                    <li key={p.id}>
                      {p.name} – Score: {p.score}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ul>
          {lobby.players.some((p) => p.id === socket.id && p.isHost) && (
            <button
              onClick={handleStartGame}
              className="bg-red-500 text-white px-2 py-1 mt-2"
            >
              Start Game
            </button>
          )}
        </div>
      )}

      {/* Game grid */}
      {gameState && (
        <div>
          <h2>Remaining Time: {Math.ceil(gameState.remainingTime)}</h2>
          <GameGrid gameState={gameState} />
          <p className="mt-2">Use WASD or arrow keys to move your player</p>
        </div>
      )}
    </div>
  );
}
