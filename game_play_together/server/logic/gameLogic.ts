import { GameState, Position } from '@/shared/types';

export function movePlayer(
  state: GameState,
  dir: 'up' | 'down' | 'left' | 'right'
): GameState {
  if (state.status === 'finished') return state;

  const { player, gridWidth, gridHeight } = state;

  let nx = player.x;
  let ny = player.y;

  if (dir === 'up') ny--;
  if (dir === 'down') ny++;
  if (dir === 'left') nx--;
  if (dir === 'right') nx++;

  if (nx < 0 || ny < 0 || nx >= gridWidth || ny >= gridHeight) {
    return state;
  }

  const sweets = [...state.sweets];
  const sweetIndex = sweets.findIndex(s => s.x === nx && s.y === ny);

  let score = player.score;
  if (sweetIndex !== -1) {
    sweets.splice(sweetIndex, 1);
    score++;
  }

  const finished = sweets.length === 0;

  return {
    ...state,
    sweets,
    status: finished ? 'finished' : 'playing',
    player: {
      ...player,
      x: nx,
      y: ny,
      score
    }
  };
}
