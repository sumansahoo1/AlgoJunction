# AlgoJunction

A LeetCode-style DSA practice platform where users solve coding problems in a secure, Docker-isolated environment, track their submission history, and monitor progress over time.

**Live:** [algojunction.sumansahoo.com](https://algojunction.sumansahoo.com)

---

## Features

- Browse a curated list of DSA problems
- Write and run Java code in a sandboxed Docker container
- Google sign-in via Firebase
- Submission history and contribution graph on your profile page
- Responsive split-pane editor (problem description + code editor + console)

---

## Architecture

```
AlgoJunction/
├── client/               # React + TypeScript frontend  →  Vercel
├── server/               # Node.js + Express backend    →  VM / any server
├── deploy-client.sh      # One-command frontend deployment
└── deploy-server.sh      # One-command backend deployment
```

```
Browser
  │  Google OAuth (Firebase)
  ▼
client (Vite / React)
  │  REST (axios)  VITE_BACKEND_URL
  ▼
server (Express / Node.js)
  ├── MongoDB Atlas  (submissions, users)
  └── Docker         (sandboxed Java execution per submission)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion |
| Code editor | CodeMirror 6 |
| Auth | Firebase (Google OAuth) |
| State | Redux Toolkit |
| Backend | Node.js (ESM), Express |
| Database | MongoDB Atlas (Mongoose) |
| Code execution | Docker (OpenJDK 11 container) |
| Frontend hosting | Vercel |
| Backend hosting | Any Linux VM |

---

## Prerequisites

| Tool | Required for |
|---|---|
| Node.js ≥ 18 | both |
| Yarn | both |
| Docker | backend (Java execution) |
| MongoDB Atlas account | backend |
| Firebase project | frontend + auth |
| Vercel CLI (`npm i -g vercel`) | frontend deployment only |
| PM2 (`npm i -g pm2`) | backend production (optional but recommended) |

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/suman-somu/AlgoJunction.git
cd AlgoJunction
```

### 2. Configure environment — Backend

```bash
cp server/.env.example server/.env
```

Open `server/.env` and set:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → cluster → Connect → Drivers |

### 3. Configure environment — Frontend

```bash
cp client/.env.example client/.env
```

Open `client/.env` and set:

| Variable | Where to get it |
|---|---|
| `VITE_BACKEND_URL` | `http://localhost:3000` for local dev |
| `VITE_FIREBASE_API_KEY` | [Firebase Console](https://console.firebase.google.com) → Project settings → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |

### 4. Start the backend

```bash
cd server
yarn install
yarn start          # nodemon — auto-reloads on change, port 3000
```

### 5. Start the frontend

```bash
cd client
yarn install
yarn dev            # Vite dev server, port 5173
```

Open [http://localhost:5173](http://localhost:5173).

---

## Deployment

Both scripts live at the repo root. Run them from there.

### Deploy frontend → Vercel

```bash
./deploy-client.sh
```

What it does:
1. Checks that `client/.env` exists
2. `yarn install --frozen-lockfile`
3. `yarn build` (outputs to `client/dist/`)
4. `vercel --prod` (requires Vercel CLI and a linked project)

**First-time Vercel setup:**
- Install CLI: `npm i -g vercel`
- Inside `client/`, run `vercel link` and follow the prompts
- Add all `VITE_*` variables in the Vercel dashboard under Project → Settings → Environment Variables
- Set **Root Directory** to `client` in Vercel project settings

### Deploy backend → VM / server

```bash
./deploy-server.sh
```

What it does:
1. Checks Docker is available
2. Checks that `server/.env` exists
3. `yarn install --frozen-lockfile`
4. Starts with **PM2** if installed (`algojunction-server`), otherwise falls back to `node src/index.js`

**Recommended VM setup:**
```bash
# Install Node 18+, Yarn, Docker, PM2 on your VM, then:
git clone https://github.com/suman-somu/AlgoJunction.git
cd AlgoJunction
cp server/.env.example server/.env   # fill in production MONGODB_URI
./deploy-server.sh
```

To tail logs after deployment:
```bash
pm2 logs algojunction-server
```

---

## API Reference

All endpoints are served by the backend at the configured `VITE_BACKEND_URL`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/questions` | Full question list with details |
| `GET` | `/questionlist` | Minimal list (id + title) |
| `GET` | `/question/:id` | Single question by id |
| `GET` | `/totalquestions` | Total question count |
| `POST` | `/run-java` | Compile and run submitted Java code in Docker |
| `GET` | `/profile?username=&email=` | User profile with submission history |

### `POST /run-java` body

```json
{
  "quesid": "1",
  "javaCode": "public class Solution { ... }",
  "username": "john",
  "email": "john@example.com"
}
```

---

## Environment Variables Reference

### `server/.env`

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
```

### `client/.env`

```
VITE_BACKEND_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Neither file is committed. See the `.env.example` in each directory for a template.
