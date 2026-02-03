"use client";

import React from "react";
import type { GameState } from "@/lib/shared/types";

type Props = {
  gameState: GameState;
};

export default function GameGrid({ gameState }: Props) {
  const { gridWidth, gridHeight, players, sweets } = gameState;

  // Convert sweets to a map for faster lookup
  const sweetMap = new Set(sweets.map((s) => `${s.x},${s.y}`));

  return (
    <div
      className="inline-grid border"
      style={{
        gridTemplateColumns: `repeat(${gridWidth}, 24px)`,
        gridTemplateRows: `repeat(${gridHeight}, 24px)`,
      }}
    >
      {Array.from({ length: gridWidth * gridHeight }).map((_, idx) => {
        const x = idx % gridWidth;
        const y = Math.floor(idx / gridWidth);

        // Check if a player is on this cell
        const player = Object.values(players).find((p) => p.x === x && p.y === y);

        return (
          <div
            key={`${x}-${y}`}
            className="w-6 h-6 border border-gray-300 flex items-center justify-center"
          >
            {player ? (
              <div
                className="w-5 h-5 rounded-full"
                style={{ backgroundColor: player.color }}
                title={`${player.name}: ${player.score}`}
              />
            ) : sweetMap.has(`${x},${y}`) ? (
              <div className="w-3 h-3 bg-pink-500 rounded-full" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
