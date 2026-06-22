# AlgoJunction — Backend

Express + MongoDB API server for AlgoJunction.

## Tech stack

- Node.js (ESM), Express
- MongoDB Atlas via Mongoose (Users, Submissions, Questions)
- Firebase Admin SDK (server-side token verification)
- Docker (Eclipse Temurin 11 JDK) for sandboxed Java code execution
- Rate limiting: express-rate-limit (app-level) + Nginx limit_req (reverse proxy)
- dotenv

## Prerequisites

- **Node.js** ≥ 18
- **Yarn**
- **Docker** (required for code execution — pre-build the image with `docker build -t algojunction-java-executor server/src/docker`)
- **MongoDB Atlas account** (free tier works)
- **Firebase project** (for server-side token verification)

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
| `MONGODB_URI` | MongoDB Atlas → Your cluster → Connect → Drivers → copy connection string |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Firebase Console → Project Settings → Service accounts → Generate new private key → `base64 -w0 < key.json` |
| `ADMIN_EMAILS` | Comma-separated Google emails for question management access |

**3. Seed questions (first time only)**

```bash
node src/scripts/seedQuestions.js
```

This migrates the 4 starter problems into MongoDB. Idempotent — safe to re-run.

**4. Start dev server**

```bash
yarn start
```

The server runs on port `3000` by default with nodemon auto-reload.

## Deployment (VM)

1. Copy the repo to your server.
2. Create `.env` with production values:
   - `MONGODB_URI` — production MongoDB connection string
   - `FIREBASE_SERVICE_ACCOUNT_BASE64` — base64-encoded service account key
   - `ADMIN_EMAILS` — your Google email(s) for admin access
3. Pre-build the Java executor image:
   ```bash
   docker build -t algojunction-java-executor server/src/docker
   ```
4. Install dependencies: `yarn install --frozen-lockfile`
5. Run the seed script once: `node src/scripts/seedQuestions.js`
6. Run with PM2:
   ```bash
   pm2 start ecosystem.config.cjs
   pm2 save
   ```
7. Set up Nginx reverse proxy (see `server/nginx/algojunction.conf`). The config includes `limit_req` rate limiting (30 req/s burst 20 with 429 status). The `limit_req_zone` must be added to `/etc/nginx/nginx.conf` http block as noted in the file comments.

## Scripts

| Script | Purpose |
|---|---|
| `yarn start` | Start with nodemon (auto-reload, port 3000) |
| `yarn lint` | ESLint (`src/ --ext .js`) |
| `node src/scripts/seedQuestions.js` | One-time: seed questions into MongoDB |
| `node src/scripts/dbTransactions.js` | One-off DB seeding test script (requires `.env`) |

## API Endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Health check (MongoDB status + server status + uptime) | No |
| GET | `/questions` | All questions with details + boilerplate | No |
| GET | `/questionlist` | Minimal list (id, name, difficulty) | No |
| GET | `/question/:id` | Single question by ID | No |
| GET | `/totalquestions` | Total problem count | No |
| GET | `/questions/solved` | Solved question IDs for current user | **Yes** |
| POST | `/run-java` | Execute Java code in Docker sandbox | **Yes** |
| GET | `/profile` | User profile + submissions + stats | **Yes** |
| POST | `/admin/questions` | Create a new question | **Yes + Admin** |
| PUT | `/admin/question/:id` | Update a question | **Yes + Admin** |
| DELETE | `/admin/question/:id` | Delete a question | **Yes + Admin** |

### Authentication

Protected routes require `Authorization: Bearer <firebase-id-token>`. The token is verified server-side using Firebase Admin SDK. User identity is extracted from the verified token — never from client-provided fields.

Admin routes additionally require the user's email to be in the `ADMIN_EMAILS` allowlist.

## Related

- Frontend: [`../client`](../client)
- Full API docs: [`../README.md`](../README.md)
- Architecture: [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
