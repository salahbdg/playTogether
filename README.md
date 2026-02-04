
# PlayTogether – Multiplayer Real-Time Game

A web-based multiplayer real-time game built with **Next.js (App Router), TypeScript, Tailwind CSS**, and **Socket.IO**. Players join lobbies, move on a shared grid, collect sweets, and compete for the highest score.

Live Demo: [https://playtogether-production.up.railway.app](https://playtogether-production.up.railway.app)

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Game Mechanics](#game-mechanics)
5. [Installation & Development](#installation--development)
6. [Deployment](#deployment)
7. [Folder Structure](#folder-structure)
8. [Future Improvements](#future-improvements)

---

## Features

* **Real-time multiplayer** with Socket.IO
* **Lobby system**: create/join lobbies with a unique code
* **Server-authoritative architecture**: server manages game state
* **Grid-based gameplay**: players move using WASD or arrow keys
* **Sweets collection**: players collect sweets, scores update live
* **Dynamic scoring**: live leaderboard, winner determination
* **Responsive UI** built with Tailwind CSS

---

## Tech Stack

* **Frontend**: Next.js (App Router), React, Tailwind CSS, TypeScript
* **Backend**: Node.js with Socket.IO (server runs inside `server.ts`)
* **Real-time Communication**: WebSockets (Socket.IO)
* **Package Manager**: PNPM
* **Deployment**: Railway

---

## Architecture

### Server-Authoritative Design

* The **server owns the game state**: grid, player positions, sweets, scores, timers.
* **Clients only send input** (movement intentions).
* Server validates input, updates state, and broadcasts updates to all players.
* Cheating prevention:

  * Enforces grid boundaries
  * Rejects impossible moves
  * Handles collisions deterministically

---

### Socket.IO Events

#### Client → Server

| Event          | Payload                          | Description                |        |                             |                       |
| -------------- | -------------------------------- | -------------------------- | ------ | --------------------------- | --------------------- |
| `lobby:create` | `{ name: string }`               | Create a new lobby         |        |                             |                       |
| `lobby:join`   | `{ code: string, name: string }` | Join an existing lobby     |        |                             |                       |
| `lobby:leave`  | `void`                           | Leave the current lobby    |        |                             |                       |
| `lobby:ready`  | `{ ready: boolean }`             | Toggle ready status        |        |                             |                       |
| `game:start`   | `void`                           | Start the game (host only) |        |                             |                       |
| `game:input`   | `{ dir: "up"                     | "down"                     | "left" | "right", seq, clientTime }` | Player movement input |

#### Server → Client

| Event           | Payload                                    | Description                   |
| --------------- | ------------------------------------------ | ----------------------------- |
| `lobby:state`   | `{ lobby: Lobby }`                         | Broadcast current lobby state |
| `game:state`    | `{ gameState: GameState }`                 | Broadcast current game state  |
| `game:finished` | `{ results: { playerId, name, score }[] }` | Game finished and results     |

---

## Game Mechanics

* **Grid**: default 20x20, configurable
* **Sweets**: 50 spawned at random empty tiles
* **Players**: each has a unique color and name
* **Movement**: arrow keys / WASD, 1 tile per tick
* **Tick rate**: 10 updates/sec
* **Match duration**: 60 seconds (or ends when all sweets are collected)
* **Score**: increments when a player collects a sweet
* **End game**: winner is determined based on highest score

---

## Installation & Development

### Prerequisites

* Node.js >= 20
* PNPM package manager

### Setup

```bash
# Clone repository
git clone <your-repo-url>
cd my-app

# Install dependencies
pnpm install
```

### Running Locally

```bash
# Run dev server (Next.js + Socket.IO)
pnpm run dev
```

* Access at `http://localhost:3000`
* Multiple tabs simulate multiple players

### Building for Production

```bash
pnpm build
pnpm start
```

* Ensure `server.ts` listens on `process.env.PORT` for deployment

---

## Deployment

This project can be deployed for free on **Railway**:

1. Connect your GitHub repository to Railway
2. Set the **start command**:

```bash
NODE_ENV=production tsx server.ts
```

3. Ensure the `server.ts` listens on `process.env.PORT`:

```ts
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

4. Update client socket connection:

```ts
const socket = io(window.location.origin);
```

5. Deploy → Access your live URL:

[https://playtogether-production.up.railway.app](https://playtogether-production.up.railway.app)

---

## Folder Structure

```
my-app/
│
├─ lib/
│   ├─ shared/        # Shared types and Socket.IO event interfaces
│   └─ server/        # Server-side logic (lobbyManager, gameManager)
│
├─ components/        # React components (GameGrid, Player)
│
├─ app/               # Next.js App Router pages
│   └─ page.tsx       # Main UI, socket connection, game lobby
│
├─ server.ts          # Socket.IO server + HTTP server
├─ package.json
└─ tailwind.config.js
```

---

## Future Improvements

* Add **chat feature** in lobbies
* Add **power-ups / special sweets**
* Persist scores using a **database**
* Improve **mobile UX**
* Add **spectator mode**

---

## Appreciation

Developping this game was a real headache, but one we enjoyed, managing state and synchronizing 
players wasn't easy at all, let alone weird behaviours that were hard to explain and debug.
Overall this project game us a sense of hard it could be to developped distributed systems and
how hard to debug them, we learnt the crucial importance of having a rigid clear architecture to follow and to work incrementally, step by step, validating each step as we go on.


