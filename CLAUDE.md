# AlgoJunction — CLAUDE.md

## Project Overview

AlgoJunction is a LeetCode-style DSA practice platform where users solve coding problems in a secure, Docker-isolated environment, track submission history, and monitor progress over time.

**Live:** https://algojunction.sumansahoo.com  
**Repo:** https://github.com/sumansahoo1/AlgoJunction

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Editor** | CodeMirror 6 (Java, C++, Python langs) |
| **Auth** | Firebase (Google OAuth 2.0) + Firebase Admin SDK (server-side) |
| **State** | Redux Toolkit |
| **Backend** | Node.js 18+ (ESM), Express.js |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Code Execution** | Docker (Eclipse Temurin 11 JDK), sandboxed |
| **Charts** | Chart.js, @uiw/react-heat-map |
| **Rate Limiting** | express-rate-limit (app) + Nginx limit_req (reverse proxy) |
| **CI/CD** | GitHub Actions (CI + auto-deploy to Oracle VM) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Oracle VM |
| **Process Manager** | PM2 (production) |

---

## Project Structure

```
AlgoJunction/
├── .github/workflows/
│   ├── ci.yml                # CI (lint, typecheck, build, smoke test, Docker build)
│   └── cd-server.yml         # Auto-deploy to Oracle VM on push to main
├── client/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                  # Router + Firebase init
│   │   ├── main.tsx                 # React DOM entry
│   │   ├── store.ts                 # Redux store
│   │   ├── components/              # UI components (shadcn-style ui/)
│   │   └── lib/
│   │       ├── pages/               # Route pages: auth, home, landing, problem, profile, error
│   │       ├── features/            # Redux slices (questions, totalques)
│   │       ├── component/           # Shared components (Header, progress)
│   │       └── utils.ts             # Utility functions & TypeScript interfaces
│   ├── .env.example
│   ├── package.json                 # Yarn
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                          # Node.js + Express backend (ESM)
│   ├── src/
│   │   ├── index.js                 # Entry point (port 3000)
│   │   ├── routes/routes.js         # All API route definitions
│   │   ├── controllers/             # questionsController, runJavaController, profileController, questionAdminController
│   │   ├── middleware/
│   │   │   ├── auth.js              # Firebase ID token verification
│   │   │   ├── adminAuth.js         # Admin email allowlist check
│   │   │   └── rateLimiter.js       # Rate limiting (global + per-endpoint)
│   │   ├── config/
│   │   │   └── firebaseAdmin.js     # Firebase Admin SDK (lazy init)
│   │   ├── db/
│   │   │   ├── connectDb.js         # MongoDB connection with retry logic
│   │   │   ├── data.js              # DEPRECATED — seed reference only
│   │   │   ├── mongooseClient.js    # Mongoose CRUD operations (User, Submission, Question)
│   │   │   ├── schema/dbSchema.js    # DB schema definitions (User, Submission, Question)
│   │   │   └── utils/formatDate.js   # Date formatting helpers
│   │   ├── docker/Dockerfile         # Eclipse Temurin 11 JDK image for code execution
│   │   ├── execute/                  # Solution.java written per execution
│   │   ├── inputs/input.txt          # Test input written per test case
│   │   └── scripts/
│   │       ├── seedQuestions.js      # One-time question migration to MongoDB
│   │       └── dbTransactions.js     # DB seeding test script
│   ├── .env.example
│   ├── package.json                 # Yarn
│   ├── ecosystem.config.cjs         # PM2 config
│   └── nginx/
│       └── algojunction.conf        # Nginx reverse proxy config
│
├── deploy-client.sh                 # Vercel deployment
├── deploy-server.sh                  # VM deployment (PM2)
├── README.md
└── CLAUDE.md                        # This file
```

---

## API Endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Health check (MongoDB + server) | No |
| GET | `/questions` | All questions with details + boilerplate | No |
| GET | `/questionlist` | Minimal list (id + title + difficulty) | No |
| GET | `/question/:id` | Single question by ID | No |
| GET | `/totalquestions` | Total problem count | No |
| GET | `/questions/solved` | Solved question IDs for current user | **Yes** |
| POST | `/run-java` | Compile & run Java code in Docker | **Yes** |
| GET | `/profile` | User profile + submissions + stats | **Yes** |
| POST | `/admin/questions` | Create a new question | **Yes + Admin** |
| PUT | `/admin/question/:id` | Update a question | **Yes + Admin** |
| DELETE | `/admin/question/:id` | Delete a question | **Yes + Admin** |

**Auth:** Protected routes use `authenticate` middleware (Firebase ID token in `Authorization: Bearer <token>` header). Admin routes additionally require `requireAdmin` middleware (email in `ADMIN_EMAILS` allowlist).

---

## Common Commands

### Backend (server/)
```bash
cd server
yarn install          # Install deps
yarn start            # Start with nodemon (port 3000)
yarn lint             # ESLint (src/ --ext .js)
node src/scripts/seedQuestions.js  # One-time: seed questions into MongoDB
```

### Frontend (client/)
```bash
cd client
yarn install          # Install deps
yarn dev              # Vite dev server (port 5173)
yarn build            # TypeScript check + Vite build
yarn lint             # ESLint
```

### Deployment
```bash
./deploy-client.sh    # Deploy frontend to Vercel
./deploy-server.sh    # Deploy backend to VM (Docker + PM2)
```

CI auto-deploys the server on push to `main` via `cd-server.yml`.

---

## Environment Variables

### server/.env
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?...
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-service-account-json>
ADMIN_EMAILS=admin@example.com,another@example.com
PORT=3000
NODE_ENV=production
```

### client/.env
```
VITE_BACKEND_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## Development Conventions

- **Package manager**: Yarn (both client and server). Lockfiles are `yarn.lock`.
- **Server module system**: ESM (`"type": "module"` in package.json). Use `import`/`export`, not `require`.
- **Code style**: TypeScript on frontend, JavaScript (ESM) on backend.
- **Routing**: React Router v6 with `createBrowserRouter`.
- **State**: Redux Toolkit with slices in `client/src/lib/features/`.
- **API calls**: axios.
- **Code execution**: Java only currently (Eclipse Temurin 11 in Docker). C++ and Python planned. Pre-built image, code volume-mounted at runtime.
- **Git**: Standard feature branch workflow (`feature/your-feature`).
- **Commits**: [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`.

---

## Key Notes

- **Questions live in MongoDB** (`Question` model). `data.js` is deprecated — retained only as a seed reference. Add new questions via the admin API (`POST /admin/questions`) or Atlas UI.
- **Server-side auth**: Firebase ID tokens are verified on every protected request by `middleware/auth.js` using Firebase Admin SDK. User identity (`uid`, `email`, `name`) is extracted from the verified token — never from the request body.
- **Admin access**: Controlled by `ADMIN_EMAILS` env var (comma-separated email allowlist). Admin routes require both `authenticate` (valid Firebase token) and `requireAdmin` (email in allowlist).
- The Docker sandbox for Java execution is essential — do not modify execution paths without testing container isolation.
- The pre-built Docker image (`algojunction-java-executor`) contains only the JDK. User code is volume-mounted at runtime.
- Firebase is initialized in `App.tsx` using VITE_* env vars. Firebase Admin SDK is lazily initialized on first API call (not at import time) to keep CI smoke tests fast.
- Deployment scripts are at the repo root and handle all steps (install, build, deploy).
- Server uses nodemon for auto-reload in development.
- File `server/src/execute/Solution.java` is overwritten per execution with user-submitted code — don't store permanent code there.
