'use client';

import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  async function createGame() {
    const res = await fetch('/api/game/create', { method: 'POST' });
    const data = await res.json();
    router.push(`/lobby/${data.code}`);
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <button
        onClick={createGame}
        className="px-6 py-3 bg-black text-white rounded"
      >
        Create Game
      </button>
    </main>
  );
}
