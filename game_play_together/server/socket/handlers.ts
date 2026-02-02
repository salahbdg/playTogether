import { Server, Socket } from 'socket.io';
import { games } from '@/server/state/gameStore';
import { movePlayer } from '@/server/logic/gameLogic';

export function handleSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('🔌 Connected', socket.id);

    socket.emit('connected', socket.id);

    socket.on('game:get', ({ code }) => {
      const game = games.get(code);
      if (game) {
        socket.join(code);
        socket.emit('game:state', game);
      }
    });

    socket.on('game:input', ({ code, dir }) => {
      const game = games.get(code);
      if (!game) return;

      const next = movePlayer(game, dir);
      games.set(code, next);

      io.to(code).emit('game:state', next);
    });
  });
}
