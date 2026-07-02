# Whiteboard

A real-time collaborative whiteboard, built from scratch to understand conflict-free sync rather than to ship on top of an existing CRDT library.

Multiple users can draw on the same board simultaneously, across tabs and devices, with changes merging automatically and consistently, even when edits happen concurrently or arrive out of order.

## Why this exists

Most collaborative editors reach for [Yjs](https://github.com/yjs/yjs) or similar. This project deliberately avoids that, implementing the underlying CRDTs by hand from [Shapiro et al. (2011)](https://hal.inria.fr/inria-00555588/document), _A Comprehensive Study of Convergent and Commutative Replicated Data Types_, to properly understand:

- how conflict-free replicated data types actually guarantee convergence
- how WebSocket-based sync protocols are designed without a framework doing it for you
- the tradeoffs between operation-based and state-based CRDTs in a real, latency-sensitive application

## Tech stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Frontend   | React, TypeScript, Konva (canvas rendering) |
| Backend    | Node.js, Express, `ws` (raw WebSockets)     |
| Sync       | Hand-rolled OR-Set and LWW-Register CRDTs   |
| Database   | PostgreSQL                                  |
| Validation | Zod (shared schemas, frontend + backend)    |
| Tooling    | npm workspaces (monorepo)                   |

## Architecture

This is a monorepo with three workspaces:

```
whiteboard/
├── apps/
│   ├── frontend/     # React + Konva canvas app
│   └── backend/      # Express server + WebSocket sync + Postgres
└── packages/
    └── shared/       # CRDT types, API types, Zod schemas — imported by both apps
```

`packages/shared` is the source of truth for anything that crosses the frontend/backend boundary: WebSocket message shapes, CRDT operation types, and HTTP request/response types. Both apps import from it directly rather than duplicating type definitions, so the sync protocol can't silently drift between client and server.

### CRDT design

- **OR-Set (Observed-Remove Set)** — used for board elements (shapes, strokes, sticky notes), allowing concurrent adds and removes from different clients to converge without lost updates.
- **LWW-Register (Last-Write-Wins Register)** — used for single-value properties (e.g. an element's position or colour) where the most recent write should win based on a logical timestamp.

Sync happens over raw WebSocket connections: each client broadcasts local operations, the server relays them to other connected clients, and every client applies incoming operations to its local CRDT state, which guarantees all replicas converge to the same result regardless of message order.

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL running locally (or a connection string to a remote instance)

### Setup

```bash
# clone and install
git clone https://github.com/am1553/whiteboard.git
cd whiteboard
npm install

# configure environment
cp .env.example .env
# then fill in DATABASE_URL and any other values

# run frontend and backend together
npm run dev
```

Or run them separately, in two terminals:

```bash
npm run dev --workspace=apps/backend    # starts on :3001
npm run dev --workspace=apps/frontend   # starts on :5173
```

Visit `http://localhost:5173`. The Vite dev server proxies `/api` and `/ws` requests through to the backend automatically.

### Building for production

```bash
npm run build
npm run start
```

## Project status

Actively in development. Current focus is on getting real-time two-tab sync working end to end before layering on persistence, auth, and multi-board support.

## License

MIT
# whiteboard
