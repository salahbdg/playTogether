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
  const [showControls, setShowControls] = useState(true);
  const [gameResults, setGameResults] = useState<{
    winners: Array<{ id: string; name: string; score: number }>;
    isWinner: boolean;
  } | null>(null);

  useEffect(() => {
    // Create socket once
    const s = io("http://localhost:3000");
    socket = s;

    socket.on("connect", () => console.log("Connected:", socket.id));

    socket.on("lobby:state", ({ lobby }) => setLobby(lobby));
    socket.on("game:state", (state) => setGameState(state));
    socket.on("game:finished", (results) => {
      console.log("Final results:", results);

      // Check if current player is a winner
      const isWinner = results.winners.some((w) => w.id === socket.id);
      
      setGameResults({
        winners: results.winners,
        isWinner,
      });

      setGameState(null);
      
      // Auto-close results after 5 seconds
      setTimeout(() => {
        setGameResults(null);
      }, 5000);
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
        console.log("Sending input:", dir);
        socket.emit("game:input", { dir });
      }
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      socket.disconnect();
    };
  }, []);

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
    setShowControls(false); // Hide controls when game starts
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Game Results Overlay - Winner/Loser Screen */}
      {gameResults && (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center ${
            gameResults.isWinner
              ? "bg-gradient-to-br from-green-600 via-green-500 to-emerald-600"
              : "bg-gradient-to-br from-red-600 via-red-500 to-rose-600"
          } animate-fadeIn`}
        >
          <div className="text-center px-8">
            {/* Trophy or X icon */}
            <div className="mb-8 animate-bounce">
              {gameResults.isWinner ? (
                <div className="text-9xl">🏆</div>
              ) : (
                <div className="text-9xl">❌</div>
              )}
            </div>

            {/* Main message */}
            <h1 className="text-7xl md:text-9xl font-black mb-6 animate-pulse">
              {gameResults.isWinner ? "YOU WON!" : "YOU LOST!"}
            </h1>

            {/* Winner(s) information */}
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">
                {gameResults.winners.length === 1 ? "Winner" : "Winners"}
              </h2>
              <div className="space-y-3">
                {gameResults.winners.map((winner) => (
                  <div
                    key={winner.id}
                    className="flex items-center justify-between bg-white/10 px-6 py-4 rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black text-xl">
                        {winner.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-2xl font-bold">{winner.name}</span>
                    </div>
                    <span className="text-3xl font-black text-yellow-300">
                      {winner.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Closing message */}
            <p className="mt-8 text-xl text-white/80">
              Screen will close in a moment...
            </p>
          </div>
        </div>
      )}

      {/* Animated background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 tracking-tight">
            PLAY TOGETHER
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Lobby controls - Hidden when showControls is false */}
          {showControls && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-blue-400">Create Lobby</h2>
                <div className="space-y-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-slate-500"
                  />
                  <button
                    onClick={handleCreateLobby}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-green-500/50"
                  >
                    Create New Lobby
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                <h2 className="text-2xl font-bold mb-6 text-purple-400">Join Lobby</h2>
                <div className="space-y-4">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-500"
                  />
                  <input
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    placeholder="Enter lobby code"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-slate-500 font-mono"
                  />
                  <button
                    onClick={handleJoinLobby}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
                  >
                    Join Lobby
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Lobby display */}
          {lobby && (
            <div className={`${showControls ? '' : 'lg:col-span-2'} animate-fadeIn`}>
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text">
                      Lobby {lobby.code}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${lobby.status === 'lobby' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                      <span className="text-slate-400 text-sm uppercase tracking-wider">{lobby.status}</span>
                    </div>
                  </div>
                  {!showControls && (
                    <button
                      onClick={() => setShowControls(true)}
                      className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm transition-all"
                    >
                      Show Controls
                    </button>
                  )}
                </div>

                {/* Players List */}
                {!gameState && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">Players</h3>
                    <div className="space-y-2">
                      {lobby.players.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 bg-slate-900/50 px-4 py-3 rounded-lg border border-slate-700/50"
                        >
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="flex-1 font-medium">{player.name}</span>
                          {player.isHost && (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-full border border-yellow-500/30">
                              HOST
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Scores during game */}
                {gameState && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-slate-300">Scores</h3>
                    <div className="space-y-2">
                      {Object.values(gameState.players)
                        .sort((a, b) => b.score - a.score)
                        .map((p, index) => (
                          <div
                            key={p.id}
                            className="flex items-center gap-3 bg-slate-900/50 px-4 py-3 rounded-lg border border-slate-700/50"
                          >
                            <div className="w-8 h-8 flex items-center justify-center font-bold text-slate-400">
                              #{index + 1}
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center font-bold">
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="flex-1 font-medium">{p.name}</span>
                            <span className="px-4 py-1 bg-blue-500/20 text-blue-400 font-bold rounded-full border border-blue-500/30">
                              {p.score}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Start Game Button */}
                {lobby.players.some((p) => p.id === socket.id && p.isHost) && !gameState && (
                  <button
                    onClick={handleStartGame}
                    className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 text-lg"
                  >
                    🎮 Start Game
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Game grid */}
        {gameState && (
          <div className="mt-8 animate-fadeIn">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">
                  Game In Progress
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-slate-400 uppercase tracking-wider">Time Remaining</div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {Math.ceil(gameState.remainingTime)}s
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
                <GameGrid gameState={gameState} />
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-6 text-slate-400">
                <div className="flex items-center gap-2">
                  <kbd className="px-3 py-1 bg-slate-700/50 rounded border border-slate-600 font-mono text-sm">W</kbd>
                  <kbd className="px-3 py-1 bg-slate-700/50 rounded border border-slate-600 font-mono text-sm">A</kbd>
                  <kbd className="px-3 py-1 bg-slate-700/50 rounded border border-slate-600 font-mono text-sm">S</kbd>
                  <kbd className="px-3 py-1 bg-slate-700/50 rounded border border-slate-600 font-mono text-sm">D</kbd>
                  <span className="ml-2">or Arrow Keys to move</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}