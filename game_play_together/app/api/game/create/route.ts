import { NextResponse } from 'next/server';
import { games } from '@/server/state/gameStore';
import { GameState } from '@/shared/types';

function randomPos(max: number) {
  return Math.floor(Math.random() * max);
}

export async function POST() {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();

  const sweets = Array.from({ length: 20 }, () => ({
    x: randomPos(10),
    y: randomPos(10)
  }));

  const game: GameState = {
    code,
    gridWidth: 10,
    gridHeight: 10,
    sweets,
    status: 'playing',
    player: {
      id: 'player-1',
      x: 0,
      y: 0,
      score: 0
    }
  };

  games.set(code, game);

  return NextResponse.json({ code });
}
