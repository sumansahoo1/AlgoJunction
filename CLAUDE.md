# AlgoJunction — CLAUDE.md

## Project Overview

AlgoJunction is a LeetCode-style DSA practice platform where users solve coding problems in a secure, Docker-isolated environment, track submission history, and monitor progress over time.

**Live:** https://algojunction.sumansahoo.com  
**Repo:** https://github.com/sumansahoo1/AlgoJunction

---

## Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion |
| **Editor** | CodeMirror 6 (Java, C++, Python langs) |
| **Auth** | Firebase (Google OAuth 2.0) |
| **State** | Redux Toolkit |
| **Backend** | Node.js 18+ (ESM), Express.js |
| **Database** | MongoDB Atlas + Mongoose ODM |
| **Code Execution** | Docker (OpenJDK 11), sandboxed |
| **Charts** | Chart.js, @uiw/react-heat-map |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Linux VM |
| **Process Manager** | PM2 (production) |

---

## Project Structure

```
AlgoJunction/
├── client/                          # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx                  # Router + Firebase init
│   │   ├── main.tsx                 # React DOM entry
│   │   ├── store.ts                 # Redux store
│   │   ├── components/              # UI components (icons, shadcn-style ui/)
│   │   └── lib/
│   │       ├── pages/               # Route pages: auth, home, landing, problem, profile, error
│   │       ├── features/            # Redux slices (questions, totalques)
│   │       ├── component/           # Shared components (Header, progress)
│   │       └── utils.ts             # Utility functions
│   ├── .env.example
│   ├── package.json                 # Yarn
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                          # Node.js + Express backend (ESM)
│   ├── src/
│   │   ├── index.js                 # Entry point (port 3000)
│   │   ├── routes/routes.js         # All API route definitions
│   │   ├── controllers/             # questionsController, runJavaController, profileController
│   │   ├── db/
│   │   │   ├── connectDb.js         # MongoDB connection
│   │   │   ├── data.js              # Problem seed data (100+ problems)
│   │   │   ├── mongooseClient.js    # Mongoose schemas + models
│   │   │   ├── schema/dbSchema.js   # DB schema definitions
│   │   │   └── utils/formatDate.js  # Date formatting helpers
│   │   ├── docker/Dockerfile        # OpenJDK 11 Docker image for code execution
│   │   ├── execute/                 # Java compilation & execution logic
│   │   ├── inputs/input.txt         # Test input files
│   │   └── scripts/                 # dbTransactions, populateUsers, showUsers
│   ├── .env.example
│   └── package.json                 # Yarn
│
├── deploy-client.sh                 # Vercel deployment
├── deploy-server.sh                 # VM deployment (PM2)
├── README.md
└── CLAUDE.md                        # This file
```

---

## API Endpoints

| Method | Route | Description | Auth |
|---|---|---|---|
| GET | `/` | Health check | No |
| GET | `/questions` | All questions with details + boilerplate | No |
| GET | `/questionlist` | Minimal list (id + title) | No |
| GET | `/question/:id` | Single question by ID | No |
| GET | `/totalquestions` | Total problem count | No |
| POST | `/run-java` | Compile & run Java code in Docker | Yes |
| GET | `/profile?username=&email=` | User profile + submissions + stats | No |

---

## Common Commands

### Backend (server/)
```bash
cd server
yarn install          # Install deps
yarn start            # Start with nodemon (port 3000)
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

---

## Environment Variables

### server/.env
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?...
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
- **Code execution**: Java only currently (OpenJDK 11 in Docker). C++ and Python planned.
- **Git**: Standard feature branch workflow (`feature/your-feature`).

---

## Key Notes

- The Docker sandbox for Java execution is essential — do not modify execution paths without testing container isolation.
- Firebase is initialized in `App.tsx` using VITE_* env vars.
- Deployment scripts are at the repo root and handle all steps (install, build, deploy).
- Server uses nodemon for auto-reload in development.
- File `server/src/execute/Solution.java` is the compiled Java entry point — modifications here affect how user code runs.
