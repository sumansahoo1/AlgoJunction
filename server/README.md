# AlgoJunction — Backend

Express + MongoDB API server for AlgoJunction.

## Tech stack

- Node.js (ESM), Express
- MongoDB via Mongoose
- Firebase Admin SDK (token verification)
- dotenv

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
3. Install dependencies: `yarn install --production`
4. Run with a process manager, e.g. pm2:

```bash
pm2 start src/index.js --name ajbackend
```

## Scripts

| Script | Purpose |
|---|---|
| `yarn start` | Start with nodemon (auto-reload) |
| `node src/scripts/dbTransactions.js` | One-off DB seeding script (requires `.env`) |

## Related

- Frontend: [`../client`](../client)
- Root README / deployment: [`../README.md`](../README.md)
