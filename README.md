# AlgoJunction

**A LeetCode-style DSA practice platform where users solve coding problems in a secure, Docker-isolated environment, track their submission history, and monitor progress over time.**

**Live:** [algojunction.sumansahoo.com](https://algojunction.sumansahoo.com)

![Build Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Node Version](https://img.shields.io/badge/node-%3E%3D18-green)
![Language](https://img.shields.io/badge/language-TypeScript-blue)

---

## Table of Contents

- [Features](#features)
- [Demo & Screenshots](#demo--screenshots)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Environment Variables Reference](#environment-variables-reference)
- [Future Enhancements & Roadmap](#future-enhancements--roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🎯 **Comprehensive Problem Library**
- Browse curated DSA problems across multiple difficulty levels (Easy/Medium/Hard)
- Detailed problem descriptions with constraints and example test cases
- Problems stored in MongoDB — add, edit, or remove via the admin API without restarting the server

### 💻 **Secure Code Execution**
- Write and run **Java** code in a sandboxed Docker container (Eclipse Temurin 11 JDK)
- **Future support**: C++ and Python (coming soon)
- Pre-built Docker image with volume-mounted code — no image rebuild per submission
- Strict resource limits: 0.5 CPU, 512MB RAM, no network, read-only filesystem, dropped capabilities
- Compilation and runtime error reporting with time/memory limit detection

### 🔐 **Authentication & Security**
- Seamless Google sign-in via Firebase
- **Server-side token verification**: Every protected request's Firebase ID token is verified by the backend using Firebase Admin SDK
- User identity (uid, email, name) is extracted from the verified token — never trusted from client-provided fields
- **Admin access control**: Question management restricted to email allowlist (`ADMIN_EMAILS`)
- 401 responses trigger automatic sign-out on the frontend

### 📊 **Progress Tracking & Analytics**
- **Contribution Graph**: Visual heatmap of your submission activity (similar to GitHub)
- **Solved Badges**: "Solved" indicator on the problem list for completed questions
- **Submission History**: View all past submissions with timestamps, question names, and results
- **Profile Dashboard**: Track solved count, total problems, and improvement over time

### 🎨 **Responsive & Intuitive UI**
- **Split-Pane Editor**: Problem description, code editor, and console output in one view
- Responsive design works seamlessly on desktop, tablet, and mobile devices
- Dark mode and light mode support (class-based Tailwind strategy)
- Real-time syntax highlighting with CodeMirror 6

### ⚡ **Developer-Friendly**
- RESTful API with rate limiting
- Well-documented endpoints for custom client development
- MongoDB-based persistence for users, submissions, and questions
- Redux state management for predictable application state
- CI/CD pipeline via GitHub Actions — auto-deploy on push to main

---

## Architecture

```
AlgoJunction/
├── client/               # React + TypeScript frontend  →  Vercel
├── server/               # Node.js + Express backend    →  Oracle VM
├── .github/workflows/    # CI + auto-deploy pipeline
├── deploy-client.sh      # One-command frontend deployment
└── deploy-server.sh      # One-command backend deployment
```

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (User)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AlgoJunction Frontend (React + TypeScript)              │   │
│  │  - Problem Browsing (with Solved badges)                 │   │
│  │  - Code Editor (CodeMirror)                              │   │
│  │  - Profile Dashboard                                     │   │
│  │  - Contribution Graph                                    │   │
│  └────────────────┬─────────────────────────────────────────┘   │
└───────────────────┼─────────────────────────────────────────────┘
                    │ REST API (axios) + Bearer Token
                    │ VITE_BACKEND_URL
                    ▼
        ┌──────────────────────────┐
         │   Express Backend        │
         │   (Node.js + ESM)         │
        │                          │
        │  Routes:                 │
        │  - /questions (MongoDB)  │
        │  - /question/:id         │
        │  - /run-java (auth)      │
        │  - /profile (auth)       │
        │  - /admin/questions (admin)│
        └──────────┬───────────────┘
                   │
        ┌──────────┴────────────┐
        │                       │
        ▼                       ▼
   ┌─────────────┐        ┌──────────────┐
    │ MongoDB     │        │ Docker       │
    │ Atlas       │        │ Container    │
    │             │        │              │
    │ - Users     │        │ - Temurin 11 │
    │ - Questions │        │ - Sandbox    │
    │ - Submissions        │ - Execution  │
   └─────────────┘        └──────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Framer Motion |
| **Code Editor** | CodeMirror 6 with syntax highlighting for Java |
| **Authentication** | Firebase (Google OAuth 2.0) + Firebase Admin SDK (server-side verification) |
| **State Management** | Redux Toolkit |
| **Backend** | Node.js 18+ (ESM), Express.js |
| **Database** | MongoDB Atlas with Mongoose ODM (Users, Questions, Submissions) |
| **Code Execution** | Docker (Eclipse Temurin 11 JDK) with sandboxed environment |
| **Charts & Graphs** | Chart.js, React Heat Map for contribution tracking |
| **UI Components** | shadcn/ui, Lucide React Icons |
| **Rate Limiting** | express-rate-limit (app-level) + Nginx limit_req (reverse proxy) |
| **CI/CD** | GitHub Actions (CI + auto-deploy to Oracle VM) |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Oracle VM |
| **Process Manager** | PM2 (production) |

---

## Project Structure

```
AlgoJunction/
│
├── .github/workflows/
│   ├── ci.yml                    # CI (lint, typecheck, build, smoke test)
│   └── cd-server.yml             # Auto-deploy server to VM
│
├── client/                          # React Frontend
│   ├── src/
│   │   ├── App.tsx                  # Router + Firebase init
│   │   ├── main.tsx                 # React DOM entry point
│   │   ├── store.ts                 # Redux store
│   │   ├── components/              # Reusable UI components (shadcn-style)
│   │   │   └── ui/                  # Button, Card, Input, Tabs, etc.
│   │   ├── lib/
│   │   │   ├── component/           # Shared components (Header, progress)
│   │   │   ├── features/            # Redux slices (questions, totalques)
│   │   │   ├── pages/               # Page components
│   │   │   │   ├── auth/            # Sign-in page
│   │   │   │   ├── home/            # Problem list page
│   │   │   │   ├── landing/         # Landing/marketing page
│   │   │   │   ├── problem/         # Problem solving page
│   │   │   │   │   └── components/  # Editor, ProblemDesc, Console
│   │   │   │   ├── profile/         # User profile page
│   │   │   │   └── error/           # 404 error page
│   │   │   └── utils.ts             # Utility functions & TypeScript interfaces
│   │   └── index.css                # Tailwind directives + global styles
│   ├── .env.example                 # Environment template
│   ├── .nvmrc                       # Node version (24.x)
│   ├── package.json
│   └── vite.config.ts               # Vite configuration
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.js                 # Server entry point (port 3000)
│   │   ├── config/
│   │   │   └── firebaseAdmin.js     # Firebase Admin SDK (lazy init)
│   │   ├── middleware/
│   │   │   ├── auth.js              # Firebase ID token verification
│   │   │   ├── adminAuth.js         # Admin email allowlist check
│   │   │   └── rateLimiter.js       # Rate limiting middleware
│   │   ├── routes/
│   │   │   └── routes.js            # All API route definitions + health check
│   │   ├── controllers/             # Business logic
│   │   │   ├── runJavaController.js # Docker sandbox code execution
│   │   │   ├── questionsController.js
│   │   │   ├── questionAdminController.js
│   │   │   └── profileController.js
│   │   ├── db/                      # Database connection & models
│   │   │   ├── connectDb.js         # MongoDB connection with retry logic
│   │   │   ├── data.js              # DEPRECATED — seed reference only
│   │   │   ├── mongooseClient.js    # Mongoose CRUD (User, Submission, Question)
│   │   │   ├── schema/
│   │   │   │   └── dbSchema.js      # Mongoose schemas (User, Submission, Question)
│   │   │   └── utils/
│   │   │       └── formatDate.js    # Date formatter (YYYY/MM/DD)
│   │   ├── docker/
│   │   │   └── Dockerfile           # Eclipse Temurin 11 JDK image
│   │   ├── execute/                 # Solution.java written per execution
│   │   ├── inputs/                  # Test input.txt written per test case
│   │   └── scripts/
│   │       ├── seedQuestions.js     # One-time question migration to MongoDB
│   │       └── dbTransactions.js    # DB seeding test script
│   ├── nginx/
│   │   └── algojunction.conf        # Nginx reverse proxy config
│   ├── .env.example                 # Environment template
│   ├── package.json
│   └── ecosystem.config.cjs         # PM2 process manager config
│
├── deploy-client.sh                 # Frontend deployment script
├── deploy-server.sh                 # Backend deployment script
├── vercel.json                      # Vercel deployment config
├── README.md                        # This file
├── ARCHITECTURE.md                  # Detailed architecture
├── AGENTS.md                        # AI agent instructions
└── .gitignore
```

### Key Directories Explained

- **`client/src/components/ui/`**: Reusable UI components (Button, Card, Tabs, etc.) — shadcn-style
- **`client/src/lib/pages/`**: Route-connected page components (auth, home, landing, problem, profile, error)
- **`client/src/lib/features/`**: Redux Toolkit slices (questions, totalques)
- **`client/src/lib/component/`**: Shared app-level components (Header, progress)
- **`server/src/controllers/`**: Business logic (questions, code execution, profile, admin CRUD)
- **`server/src/middleware/`**: Auth verification, admin authorization, rate limiting
- **`server/src/docker/`**: Dockerfile for the pre-built Java execution image
- **`server/src/db/`**: MongoDB connection, Mongoose schemas, CRUD operations
- **`server/nginx/`**: Nginx reverse proxy configuration for production

---

## Prerequisites

| Tool | Required for | Version |
|---|---|---|
| **Node.js** | Both frontend & backend | ≥ 18 |
| **Yarn** | Package management | Latest |
| **Docker** | Backend (Java code execution) | Latest |
| **MongoDB Atlas account** | Backend database | Free tier ok |
| **Firebase project** | Frontend auth + backend verification | Free tier ok |
| **Vercel CLI** | Frontend deployment only | `npm i -g vercel` |
| **PM2** | Backend production (optional) | `npm i -g pm2` |

---

## Getting Started

### Quick Start (3 Minutes)

#### 1. Clone the Repository

```bash
git clone https://github.com/sumansahoo1/AlgoJunction.git
cd AlgoJunction
```

#### 2. Set Up Environment Variables

**Backend:**
```bash
cp server/.env.example server/.env
# Edit server/.env and add your MongoDB URI, Firebase service account, and admin emails
```

**Frontend:**
```bash
cp client/.env.example client/.env
# Edit client/.env and add your Firebase credentials
```

#### 3. Install Dependencies & Start

**Terminal 1 - Backend:**
```bash
cd server
yarn install
yarn start
```

**Terminal 2 - Frontend:**
```bash
cd client
yarn install
yarn dev
```

#### 4. Seed Questions (first time only)
```bash
cd server
node src/scripts/seedQuestions.js
```

#### 5. Open in Browser
Navigate to [http://localhost:5173](http://localhost:5173)

---

## Local Development

### 1. Clone

```bash
git clone https://github.com/sumansahoo1/AlgoJunction.git
cd AlgoJunction
```

### 2. Configure Environment — Backend

```bash
cp server/.env.example server/.env
```

Open `server/.env` and set:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) → cluster → Connect → Drivers |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | [Firebase Console](https://console.firebase.google.com) → Project Settings → Service accounts → Generate new private key → `base64 -w0 < key.json` |
| `ADMIN_EMAILS` | Comma-separated Google account emails for admin access (e.g., `you@gmail.com`) |

**Example:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xyz.mongodb.net/algojunction?retryWrites=true&w=majority
FIREBASE_SERVICE_ACCOUNT_BASE64=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAiLi4uIiwKICAuLi4KfQ==
ADMIN_EMAILS=you@gmail.com
```

### 3. Configure Environment — Frontend

```bash
cp client/.env.example client/.env
```

Open `client/.env` and set:

| Variable | Where to get it |
|---|---|
| `VITE_BACKEND_URL` | `http://localhost:3000` for local dev |
| `VITE_FIREBASE_API_KEY` | [Firebase Console](https://console.firebase.google.com) → Project settings → Your apps → Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |

### 4. Start the Backend

```bash
cd server
yarn install
yarn start          # Runs with nodemon (auto-reloads on file changes), port 3000
```

**Expected output:**
```
Server is running on port 3000
Connected to MongoDB
```

### 5. Start the Frontend

```bash
cd client
yarn install
yarn dev            # Vite dev server with HMR, port 5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Seed Questions (first time)

```bash
cd server
node src/scripts/seedQuestions.js
```

This is a one-time step that migrates the 4 starter problems into MongoDB. The script is idempotent — safe to re-run.

---

## Deployment

### CI/CD Pipeline

The project uses GitHub Actions for automated CI and deployment:

- **CI** (`.github/workflows/ci.yml`): Runs on every push and PR to `main`. Checks client build, server lint, import resolution, and Docker image build.
- **CD** (`.github/workflows/cd-server.yml`): Auto-deploys the server to the Oracle VM after CI passes on `main`. Also supports manual trigger via `workflow_dispatch`.

### Deploy Frontend → Vercel

```bash
./deploy-client.sh
```

**What it does:**
1. Checks that `client/.env` exists
2. Runs `yarn install --frozen-lockfile`
3. Builds with `yarn build` (outputs to `client/dist/`)
4. Deploys via `vercel --prod` (requires Vercel CLI)

**First-time Vercel Setup:**
- Install CLI: `npm i -g vercel`
- Inside `client/`, run `vercel link` and follow prompts
- Add all `VITE_*` environment variables in Vercel Dashboard → Project → Settings → Environment Variables
- Set **Root Directory** to `client` in Vercel project settings

### Deploy Backend → VM / Server

```bash
./deploy-server.sh
```

**What it does:**
1. Checks Docker is installed
2. Pre-builds the Java executor Docker image
3. Checks that `server/.env` exists
4. Runs `yarn install --frozen-lockfile`
5. Starts with **PM2** if installed (process name: `algojunction-server`), otherwise falls back to `node src/index.js`

**Recommended VM Setup:**

```bash
# On your VM, run:
sudo apt update && sudo apt install -y nodejs npm docker.io

# Install Yarn & PM2
npm i -g yarn pm2

# Clone the repo
git clone https://github.com/sumansahoo1/AlgoJunction.git
cd AlgoJunction

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with:
#   - MONGODB_URI (production)
#   - FIREBASE_SERVICE_ACCOUNT_BASE64 (base64-encoded service account key)
#   - ADMIN_EMAILS (your Google email)
nano server/.env

# Deploy
./deploy-server.sh

# One-time: seed questions into MongoDB
cd server && node src/scripts/seedQuestions.js

# Start PM2 on system boot (optional)
pm2 startup
pm2 save

# Set up Nginx (see server/nginx/algojunction.conf)
```

**View Logs:**
```bash
pm2 logs algojunction-server
pm2 monit                          # Real-time monitoring
pm2 restart algojunction-server    # Restart the app
```

---

## API Reference

All endpoints are served by the backend at the configured `VITE_BACKEND_URL`.

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://your-backend-domain.com`

### Endpoints

| Method | Route | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | Health check (MongoDB + server) | No |
| `GET` | `/questions` | Full question list with details and boilerplate | No |
| `GET` | `/questionlist` | Minimal list (id + title + difficulty) | No |
| `GET` | `/question/:id` | Single question by ID with description | No |
| `GET` | `/totalquestions` | Total count of available problems | No |
| `GET` | `/questions/solved` | Solved question IDs for current user | **Yes** |
| `POST` | `/run-java` | Compile and run submitted Java code in Docker | **Yes** |
| `GET` | `/profile` | User profile with submission history and stats | **Yes** |
| `POST` | `/admin/questions` | Create a new question | **Yes + Admin** |
| `PUT` | `/admin/question/:id` | Update an existing question | **Yes + Admin** |
| `DELETE` | `/admin/question/:id` | Delete a question | **Yes + Admin** |

### Rate Limits

| Endpoint | Limit | Layer |
|---|---|---|
| All | 100 req/min/IP | Express (global) |
| `POST /run-java` | 5 req/min/IP (after auth) | Express |
| `GET /profile` | 20 req/min/IP (after auth) | Express |
| `GET /questions*` | 60 req/min/IP | Express |
| All | 30 req/s burst 20 | Nginx (reverse proxy) |

When a rate limit is hit, the API responds with `429 Too Many Requests` and a JSON error body.

### Authentication

Protected endpoints (`POST /run-java`, `GET /profile`, `GET /questions/solved`, admin routes) require a Firebase ID token in the `Authorization` header:

```http
Authorization: Bearer <firebase-id-token>
```

The token is obtained client-side after a successful Firebase sign-in:

```js
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const result = await signInWithPopup(auth, new GoogleAuthProvider());
const idToken = await result.user.getIdToken();
```

The backend verifies the token using the Firebase Admin SDK (`admin.auth().verifyIdToken()`) and extracts the user identity from the decoded token — never from client-provided request fields.

**401 Unauthorized response:**
```json
{
  "error": "unauthorized",
  "message": "Missing or malformed Authorization header. Expected: Bearer <idToken>"
}
```

The frontend clears local storage and redirects to the sign-in page when a 401 is received.

### `POST /run-java` Request

**Headers:**
```http
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
```

**Body:**
```json
{
  "quesid": 1,
  "javaCode": "public class Solution {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n    }\n}"
}
```

> `username` and `email` are no longer accepted in the request body. They are extracted server-side from the verified Firebase ID token.

### `POST /run-java` Response

Returns an array of test case results:
```json
[
  {
    "index": 0,
    "output": "[0, 1]",
    "expectedOutput": "[0, 1]",
    "error": null,
    "success": true
  },
  {
    "index": 1,
    "output": null,
    "expectedOutput": "[1, 2]",
    "error": "Time Limit Exceeded",
    "success": false
  }
]
```

### `GET /profile` Response

```json
{
  "dates": ["2025/04/15", "2025/04/14"],
  "totalques": 4,
  "solvedques": 2,
  "submissions": [
    {
      "submissionTime": "2025-04-15T10:30:00.000Z",
      "quesName": "Two Sum",
      "status": "accepted"
    }
  ]
}
```

### Admin Routes

**Create a question** (`POST /admin/questions`):
```json
{
  "qName": "Reverse Linked List",
  "qDifficulty": "Easy",
  "qDescription": "Given the head of a singly linked list, reverse the list...",
  "qAssumptions": "The list may be empty.",
  "examples": [{ "input": "head = [1,2,3,4,5]", "output": "[5,4,3,2,1]" }],
  "inputs": [{ "input": "5\n1 2 3 4 5", "expectedOutput": "[5, 4, 3, 2, 1]" }],
  "constraints": "0 <= list length <= 5000",
  "code": "import java.util.*;\nimport java.io.*;\n\nclass Solution {\n    ...\n}"
}
```

If `id` is omitted, it is auto-assigned as `(max existing id) + 1`.

**Update a question** (`PUT /admin/question/:id`):
Send a partial question object. The `id` field is ignored in updates.

**Delete a question** (`DELETE /admin/question/:id`):
Returns `{ "message": "Question \"Two Sum\" (id: 1) deleted successfully" }`.

---

## Environment Variables Reference

### `server/.env`

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
FIREBASE_SERVICE_ACCOUNT_BASE64=<base64-encoded-service-account-json>
ADMIN_EMAILS=admin@example.com,another@example.com
PORT=3000
NODE_ENV=production
```

| Variable | Required | Purpose |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Yes | Base64-encoded Firebase Admin SDK private key (for server-side token verification) |
| `ADMIN_EMAILS` | For admin routes | Comma-separated list of Google account emails allowed to manage questions |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (`production` or `development`) |

> **`FIREBASE_SERVICE_ACCOUNT_BASE64`**: Generate from Firebase Console → Project Settings → Service accounts → Generate new private key. Encode it: `base64 -w0 < path/to/serviceAccountKey.json`

### `client/.env`

```env
VITE_BACKEND_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Neither file is committed to the repository for security reasons. Use `.env.example` files as templates.

---

## Performance & Stats

### Current Metrics (As of June 2026)

| Metric | Value |
|---|---|
| **Total Problems** | 4 DSA problems (expandable via admin API) |
| **Supported Languages** | Java (C++, Python planned) |
| **Average Execution Time** | < 200ms per test case |
| **Database Response Time** | < 50ms |
| **Code Editor Load Time** | < 1.5s |
| **Deployment Time** | Frontend: 2-5 min, Backend: auto via CD (~2 min) |
| **Monthly Active Users** | Tracking enabled via Firebase |

### Infrastructure

- **Frontend**: Deployed on Vercel (CDN-enabled, global edge locations)
- **Backend**: Oracle VM with Docker for isolated execution
- **Database**: MongoDB Atlas (multi-region support) — 3 collections: users, submissions, questions
- **Code Execution**: Pre-built Docker image (Eclipse Temurin 11) with per-test-case volume mounts, 10s timeout

---

## Future Enhancements & Roadmap

### Phase 2 (Q2 2026)
- [ ] **Token refresh handling** — Add `onIdTokenChanged` listener to prevent 1-hour expiry sign-outs
- [ ] **Support for C++ and Python** — Add CodeMirror language packs and Docker images
- [ ] **Problem Difficulty Filter** — Filter by Easy/Medium/Hard
- [ ] **Topic-Based Categories** — Browse by Arrays, Trees, Graphs, DP, etc.
- [ ] **Leaderboard** — Rank users by problems solved and submission speed

### Phase 3 (Q3 2026)
- [ ] **Admin UI** — Frontend panel for managing questions (currently API-only)
- [ ] **Test Case Customization** — Users can add custom test cases
- [ ] **Code Template Library** — Starter templates for common patterns
- [ ] **Achievements & Badges** — Gamification (7-day streak, 100 problems solved, etc.)
- [ ] **Mobile App** — React Native version for iOS/Android

### Phase 4 (Q4 2026)
- [x] ~~**Questions in MongoDB**~~ — Done (June 2026)
- [x] ~~**Server-side auth verification**~~ — Done (June 2026)
- [x] ~~**API Rate Limiting**~~ — Done (June 2026)
- [x] ~~**CI/CD Pipeline**~~ — Done (June 2026)
- [ ] **Team Competitions** — Collaborative contests
- [ ] **Mock Interviews** — Timed challenges with randomized problems
- [ ] **Advanced Analytics** — Detailed performance breakdown

---

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository** on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** and test thoroughly
4. **Commit with conventional messages**: `git commit -m 'feat: description'`
5. **Push to your fork**: `git push origin feature/your-feature`
6. **Open a Pull Request** with a description of your changes

### Contribution Guidelines

- Follow the existing code style (TypeScript/JavaScript conventions)
- Write clear, descriptive commit messages ([Conventional Commits](https://www.conventionalcommits.org/))
- Test your changes locally before submitting a PR
- Update documentation if you change functionality
- Ensure lint passes (`yarn lint` in both `client/` and `server/`)

### Report Issues

Found a bug? Open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs. actual behavior
- Screenshots (if applicable)
- Your environment (OS, browser, Node version)

---

## License

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

## Support & Contact

- 🌐 **Live Website**: [algojunction.sumansahoo.com](https://algojunction.sumansahoo.com)
- 📧 **Email**: [contact@sumansahoo.com](mailto:contact@sumansahoo.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/sumansahoo1/AlgoJunction/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/sumansahoo1/AlgoJunction/discussions)

---

## Acknowledgments

- **CodeMirror** — Powerful code editor
- **Firebase** — Authentication and backend services
- **MongoDB** — NoSQL database
- **Docker** — Containerization and sandboxing
- **Vercel** — Frontend hosting platform
- **shadcn/ui** — Accessible component library
- **React** & **TypeScript** — Frontend framework and type safety

---

**Made with ❤️ by [Suman Sahoo](https://github.com/sumansahoo1)**

⭐ If you find this project helpful, please consider giving it a star on GitHub!
