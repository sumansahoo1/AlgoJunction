# AlgoJunction — Backend

Express + MongoDB API server for AlgoJunction.

## Tech stack

- Node.js (ESM), Express
- MongoDB Atlas via Mongoose (Users, Submissions)
- Docker (Eclipse Temurin 11 JDK) for sandboxed Java code execution
- dotenv

## Prerequisites

- **Node.js** ≥ 18
- **Yarn**
- **Docker** (required for code execution — pre-build the image with `docker build -t algojunction-java-executor server/src/docker`)
- **MongoDB Atlas account** (free tier works)

## Local setup

**1. Install dependencies**

```bash
yarn install
```

**2. Configure environment**

```bash
cp .env.example .env
```

Open `.env` and fill in:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → Your cluster → Connect → Drivers → copy the connection string |

**3. Start dev server**

```bash
yarn start
```

The server runs on port `3000` by default.

## Deployment (VM)

1. Copy the repo to your server.
2. Create `.env` with production values (never commit this file).
3. Pre-build the Java executor image:
   ```bash
   docker build -t algojunction-java-executor server/src/docker
   ```
4. Install dependencies: `yarn install --frozen-lockfile`
5. Run with PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```
6. Set up Nginx reverse proxy (see `server/nginx/algojunction.conf`).

## Scripts

| Script | Purpose |
|---|---|
| `yarn start` | Start with nodemon (auto-reload, port 3000) |
| `yarn lint` | ESLint (`src/ --ext .js`) |
| `node src/scripts/dbTransactions.js` | One-off DB seeding script (requires `.env`, test only) |

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/` | Health check (MongoDB status + server status + uptime) |
| GET | `/questions` | All questions with details + boilerplate |
| GET | `/questionlist` | Minimal list (id, name, difficulty) |
| GET | `/question/:id` | Single question by ID |
| GET | `/totalquestions` | Total problem count |
| POST | `/run-java` | Execute Java code in Docker sandbox |
| GET | `/profile?username=&email=` | User profile + submissions + stats |

## Related

- Frontend: [`../client`](../client)
- Root README / deployment: [`../README.md`](../README.md)
