import { NextResponse } from 'next/server';
import { initSocketServer } from '@/server';
import { handleSockets } from '@/server/socket/handlers';

export const runtime = 'nodejs';

let started = false;

export async function GET(req: any, res: any) {
  if (!started) {
    const io = initSocketServer(res.socket.server);
    handleSockets(io);
    started = true;
  }

  return NextResponse.json({ ok: true });
}
