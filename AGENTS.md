# AGENTS.md — AlgoJunction

## Commands

```sh
# Client
cd client && yarn dev          # Vite dev (port 5173)
yarn lint                       # ESLint, --max-warnings 0
yarn build                      # tsc && vite build (order matters)

# Server
cd server && yarn start         # nodemon src/index.js (port 3000)
yarn lint                       # ESLint (src/ --ext .js)
node src/scripts/seedQuestions.js  # One-time: seed questions into MongoDB

# Deployment
./deploy-client.sh              # yarn install --frozen-lockfile → build → vercel --prod
./deploy-server.sh              # docker build → env check → yarn install → pm2 start
```

- **CI pipeline**: `.github/workflows/ci.yml` — runs on push/PR to `main`. Four parallel jobs: client lint+typecheck+build, server lint, server smoke test (syntax + import check), Docker build.
- **CD pipeline**: `.github/workflows/cd-server.yml` — auto-deploys to Oracle VM after CI passes on `main`. SSHs in, pulls, installs deps, builds Docker image, restarts PM2.
- **No tests exist** on either side.
- Lint must pass before build (`yarn build` runs `tsc` first).

## Architecture

- **Two separate packages**: `client/` (TS, Vite) and `server/` (JS, ESM). Both use Yarn, each has its own `package.json`.
- **Questions in MongoDB**: stored in a `Question` collection (`server/src/db/schema/dbSchema.js`). `data.js` is deprecated — retained only as a seed reference. Admin CRUD routes at `POST/PUT/DELETE /admin/questions` allow dynamic management without server restart.
- **User + Submission data**: persisted in MongoDB Atlas (Mongoose) — `connectDb.js`, `dbSchema.js`, `mongooseClient.js`. MongoDB connection uses retry logic on startup; CRUD operations check connection state via `ensureConnected()` and throw `DBConnectionError` if disconnected.
- **Code execution**: pre-built Docker image `algojunction-java-executor` (from `server/src/docker/Dockerfile`, Eclipse Temurin 11 JDK). Temp dir with user code is volume-mounted into container; `javac` + `timeout java` run inside. Each test case spawns a fresh `docker run` with strict resource limits; temp dir cleaned up in `finally`.
- **Auth (client)**: Firebase initialized in `App.tsx`. Google sign-in popup via `signInWithPopup`. Token and user info stored in `localStorage` (keys: `idToken`, `username`, `email`, `photoURL`).
- **Auth (server)**: Firebase Admin SDK lazily initializes on first API call (`config/firebaseAdmin.js`). `middleware/auth.js` verifies the `Bearer <idToken>` header via `admin.auth().verifyIdToken()` and extracts `uid`, `email`, `name` from the decoded token. User identity is **never** trusted from the request body.
- **Admin auth**: `middleware/adminAuth.js` checks `req.user.email` against `ADMIN_EMAILS` env var (comma-separated allowlist). Runs after `authenticate`.
- **CORS**: Hardcoded allowlist in `server/src/index.js` — `localhost:5173` and `algojunction.sumansahoo.com`.
- **PM2 ecosystem**: `server/ecosystem.config.cjs` with name `algojunction-server`.
- **Rate limiting**: `express-rate-limit` in `server/src/middleware/rateLimiter.js`. `app.set('trust proxy', 1)` so `req.ip` reads from `X-Forwarded-For`. Global: 100 req/min/IP. Per-endpoint: `/run-java` 5 req/min, `/profile` 20 req/min, questions 60 req/min. Nginx also applies 30 req/s burst 20 at the reverse-proxy layer.

## Commits

- Use [Conventional Commits](https://www.conventionalcommits.org/): `type: short description`
- Types used in this repo: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
- Each commit must be atomic — one logical change, independently understandable and debuggable
- Before committing, stage only intended files, run `git status` and `git diff`
- Do not commit unless explicitly requested by the user

## Conventions

- ESM everywhere (`"type": "module"` in both `package.json`). Use `import`/`export`, never `require`.
- Frontend path alias: `@/` → `client/src/` (configured in `vite.config.ts` and `tsconfig.json`).
- `react-router-dom` v6 with `createBrowserRouter` (defined in `App.tsx`).
- Redux Toolkit slices in `client/src/lib/features/`.
- API calls via axios.
- Tailwind `darkMode: "class"` strategy.

## Deployment gotchas

- **Seed questions on first deploy**: After the initial deploy with MongoDB-backed questions, run `node src/scripts/seedQuestions.js` once on the VM to migrate existing problems. The script is idempotent (uses `upsert`). Subsequent deploys don't need it.
- `vercel.json` runs `corepack enable && cd client && yarn install --frozen-lockfile` — Vercel root is repo root, not `client/`.
- Vite output dir is `client/dist/`; all `VITE_*` env vars must be set in Vercel dashboard.
- Backend deploy pre-builds the Docker execution image: `docker build -t algojunction-java-executor server/src/docker`.
- Prerequisites on VM: Node.js 18+, Docker, PM2.
- Client `.nvmrc` specifies Node 24.x but CI uses Node 20.
- `FIREBASE_SERVICE_ACCOUNT_BASE64` must be set in the VM's `server/.env` for server-side token verification.
- `ADMIN_EMAILS` must be set in the VM's `server/.env` to enable question management via the admin API.
