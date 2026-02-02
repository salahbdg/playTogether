import { NextRequest, NextResponse } from 'next/server';
import { games } from '@/server/state/gameStore';
import { movePlayer } from '@/server/logic/gameLogic';

type Dir = 'up' | 'down' | 'left' | 'right';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { code, dir } = body as { code: string; dir: Dir };

  if (!code || !dir) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  const game = games.get(code);
  if (!game) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  const nextState = movePlayer(game, dir);
  games.set(code, nextState);

  return NextResponse.json(nextState);
}
