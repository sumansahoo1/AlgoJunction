# AlgoJunction

A LeetCode-style competitive programming platform — write, run, and submit code in multiple languages, track your progress, and compete on a leaderboard.

## Project structure

```
algojunction/
├── AlgoJunction/   # React + TypeScript frontend (deployed on Vercel)
└── AJbackend/      # Express + MongoDB backend (deployed on VM)
```

## Quick start

Each sub-project has its own setup guide:

- **Frontend** → [`AlgoJunction/README.md`](AlgoJunction/README.md)
- **Backend** → [`AJbackend/README.md`](AJbackend/README.md)

### TL;DR

```bash
# Backend
cd AJbackend
cp .env.example .env   # fill in MONGODB_URI
yarn install
yarn start

# Frontend (separate terminal)
cd AlgoJunction
cp .env.example .env   # fill in VITE_BACKEND_URL + Firebase vars
yarn install
yarn dev
```

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, CodeMirror |
| Auth | Firebase (Google OAuth) |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB Atlas |

## Environment variables

Neither `.env` file is committed. Copy the `.env.example` in each subfolder and fill in real values locally or in your hosting dashboard.

- Secrets stay out of Git — see each `.env.example` for what is needed and where to get it.
