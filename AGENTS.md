# AGENTS.md — AlgoJunction

## Commands

```sh
# Client
cd client && yarn dev          # Vite dev (port 5173)
yarn lint                       # ESLint, --max-warnings 0
yarn build                      # tsc && vite build (order matters)

# Server
cd server && yarn start         # nodemon (port 3000)

# Deployment
./deploy-client.sh              # yarn install --frozen-lockfile → build → vercel --prod
./deploy-server.sh              # docker build image → yarn install → pm2 start
```

- **CI pipeline**: `.github/workflows/ci.yml` — runs on push/PR to `main`. Four parallel jobs: client lint+typecheck+build, server lint, server smoke test, Docker build.
- **No tests exist** on either side.
- Lint must pass before build (`yarn build` runs `tsc` first).

## Architecture

- **Two separate packages**: `client/` (TS, Vite) and `server/` (JS, ESM). Both use Yarn, each has its own `package.json`.
- **Problems are static**: served from `server/src/db/data.js` (in-memory array, **not** MongoDB). Restart server to change problems.
- **Code execution**: pre-built Docker image `algojunction-java-executor` (from `server/src/docker/Dockerfile`). Each test case spawns a new `docker run` with resource limits; temp dir cleaned up in `finally`.
- **Auth**: Firebase initialized in `App.tsx`. Tokens stored in `localStorage` (keys: `token`, `username`, `email`, `photoURL`). **No server-side Firebase token validation** — the backend trusts client-provided `username`/`email`.
- **CORS**: Hardcoded allowlist in `server/src/index.js` — `localhost:5173` and `algojunction.sumansahoo.com`.
- **PM2 ecosystem**: `server/ecosystem.config.cjs` with name `algojunction-server`.

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

- `vercel.json` runs `corepack enable && cd client && yarn install --frozen-lockfile` — Vercel root is repo root, not `client/`.
- Vite output dir is `client/dist/`; all `VITE_*` env vars must be set in Vercel dashboard.
- Backend deploy pre-builds the Docker execution image: `docker build -t algojunction-java-executor server/src/docker`.
- Prerequisites on VM: Node.js 18+, Docker, PM2.
