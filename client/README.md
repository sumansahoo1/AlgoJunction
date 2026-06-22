# AlgoJunction — Frontend

React + TypeScript + Vite frontend for AlgoJunction, a LeetCode-style DSA practice platform.

## Tech stack

- React 18, TypeScript, Vite
- Firebase (Google OAuth 2.0)
- Redux Toolkit
- shadcn/ui + Tailwind CSS + Framer Motion
- CodeMirror 6 (Java editor)
- Chart.js + @uiw/react-heat-map (profile analytics)

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
| `VITE_BACKEND_URL` | URL of the running backend (e.g. `http://localhost:3000`) |
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

The app runs on `http://localhost:5173` with HMR.

## Production build

```bash
yarn build
```

Artifacts are output to `dist/`. Deploy to Vercel by setting **Root Directory** to `client` and adding all `VITE_*` environment variables in the Vercel dashboard.

## Authentication flow

1. User signs in via Google OAuth popup (`signInWithPopup`)
2. Firebase ID token stored in `localStorage` as `idToken`
3. Protected API calls send `Authorization: Bearer <idToken>` header
4. On 401 response → localStorage cleared → redirect to `/signin`

## Related

- Backend: [`../server`](../server)
- Full docs: [`../README.md`](../README.md)
- Architecture: [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
