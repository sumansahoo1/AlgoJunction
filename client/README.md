# AlgoJunction — Frontend

React + TypeScript + Vite frontend for AlgoJunction, a LeetCode-style competitive programming platform.

## Tech stack

- React 18, TypeScript, Vite
- Firebase (Google auth)
- Redux Toolkit
- Radix UI + Tailwind CSS
- CodeMirror (code editor)

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
| `VITE_BACKEND_URL` | URL of the running AJbackend (e.g. `http://localhost:3000`) |
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | same as above |
| `VITE_FIREBASE_PROJECT_ID` | same as above |
| `VITE_FIREBASE_STORAGE_BUCKET` | same as above |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same as above |
| `VITE_FIREBASE_APP_ID` | same as above |

**3. Start dev server**

```bash
yarn dev
```

## Production build

```bash
yarn build
```

Artifacts are output to `dist/`. Deploy to Vercel by setting **Root Directory** to `AlgoJunction` and adding all `VITE_*` environment variables in the Vercel dashboard.

## Related

- Backend: [`../AJbackend`](../AJbackend)
