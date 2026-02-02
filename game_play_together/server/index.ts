import { Server as IOServer } from 'socket.io';
import { createServer } from 'http';

let io: IOServer | null = null;

export function initSocketServer(server: any) {
  if (io) return io;

  io = new IOServer(server, {
    cors: { origin: '*' }
  });

  console.log('✅ Socket.IO initialized');

  return io;
}
