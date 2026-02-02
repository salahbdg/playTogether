'use client';

import { useEffect, useState } from 'react';
import { GameState } from '@/shared/types';
import { useParams } from 'next/navigation';

export default function LobbyPage() {
  const { code } = useParams<{ code: string }>();
  const [game, setGame] = useState<GameState | null>(null);
  const [error, setError] = useState('');

  // 🔁 Poll server state
  useEffect(() => {
    let alive = true;

    async function fetchState() {
      try {
        const res = await fetch(`/api/game/state?code=${code}`);
        if (!res.ok) throw new Error('Game not found');
        const data = await res.json();
        if (alive) setGame(data);
      } catch {
        setError('Failed to load game');
      }
    }

    fetchState();
    const id = setInterval(fetchState, 200);

    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [code]);

  // ⌨️ Input
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!game || game.status === 'finished') return;

      const map: Record<string, any> = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
      };

      const dir = map[e.key];
      if (!dir) return;

      fetch('/api/game/input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, dir })
      });
    }

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [game, code]);

  if (error) return <div>{error}</div>;
  if (!game) return <div>Loading…</div>;

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-2">
        Lobby {game.code}
      </h1>

      <p>Score: {game.player.score}</p>

      {game.status === 'finished' && (
        <p className="text-green-600 font-bold">
          🎉 Game Finished!
        </p>
      )}

      <div
        className="grid gap-1 mt-4"
        style={{
          gridTemplateColumns: `repeat(${game.gridWidth}, 24px)`
        }}
      >
        {Array.from({ length: game.gridWidth * game.gridHeight }).map((_, i) => {
          const x = i % game.gridWidth;
          const y = Math.floor(i / game.gridWidth);

          const isPlayer =
            game.player.x === x && game.player.y === y;

          const isSweet =
            game.sweets.some(s => s.x === x && s.y === y);

          return (
            <div
              key={i}
              className={`w-6 h-6 border
                ${isPlayer ? 'bg-blue-500' : ''}
                ${isSweet ? 'bg-pink-400' : ''}
              `}
            />
          );
        })}
      </div>
    </main>
  );
}
