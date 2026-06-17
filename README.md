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
- [Environment Variables](#environment-variables-reference)
- [Future Enhancements & Roadmap](#future-enhancements--roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### 🎯 **Comprehensive Problem Library**
- Browse curated DSA problems across multiple difficulty levels
- Detailed problem descriptions with constraints and example test cases
- More problems can be added by editing `server/src/db/data.js` and restarting the server

### 💻 **Secure Code Execution**
- Write and run **Java** code in a sandboxed Docker container (Eclipse Temurin 11 JDK)
- **Future support**: C++ and Python (coming soon)
- Pre-built Docker image with volume-mounted code — no image rebuild per submission
- Strict resource limits: 0.5 CPU, 512MB RAM, no network, read-only filesystem, dropped capabilities
- Compilation and runtime error reporting with time/memory limit detection

### 🔐 **Authentication & Social Integration**
- Seamless Google sign-in via Firebase
- Secure token-based authentication
- No passwords needed – OAuth 2.0 integration

### 📊 **Progress Tracking & Analytics**
- **Contribution Graph**: Visual heatmap of your submission activity (similar to GitHub)
- **Submission History**: View all past submissions with timestamps and results
- **Profile Dashboard**: Track your statistics and improvement over time
- **Performance Metrics**: See which problems you've solved and failed attempts

### 🎨 **Responsive & Intuitive UI**
- **Split-Pane Editor**: Problem description, code editor, and console output in one view
- Responsive design works seamlessly on desktop, tablet, and mobile devices
- Dark mode and light mode support
- Real-time syntax highlighting with CodeMirror 6

### ⚡ **Developer-Friendly**
- RESTful API for easy integration
- Well-documented endpoints for custom client development
- MongoDB-based data persistence
- Redux state management for predictable application state

---

## Demo & Screenshots

> **📸 Add your screenshots and demo GIFs here:**
> 
> - **Screenshot 1**: Editor Interface & Problem Description
> - **Screenshot 2**: Submission Result with Execution Output
> - **Screenshot 3**: User Profile & Contribution Graph
> - **Screenshot 4**: Problem List & Filtering
> 
> *Leave space for images – you can add them manually*

---

## Architecture

```
AlgoJunction/
├── client/               # React + TypeScript frontend  →  Vercel
├── server/               # Node.js + Express backend    →  VM / any server
├── deploy-client.sh      # One-command frontend deployment
└── deploy-server.sh      # One-command backend deployment
```

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (User)                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AlgoJunction Frontend (React + TypeScript)              │   │
│  │  - Problem Browsing                                      │   │
│  │  - Code Editor (CodeMirror)                              │   │
│  │  - Profile Dashboard                                     │   │
│  │  - Contribution Graph                                    │   │
│  └────────────────┬─────────────────────────────────────────┘   │
└───────────────────┼─────────────────────────────────────────────┘
                    │ REST API (axios)
                    │ VITE_BACKEND_URL
                    ▼
        ┌──────────────────────────┐
         │   Express Backend        │
         │   (Node.js + ESM)         │
        │                          │
        │  Routes:                 │
        │  - /questions            │
        │  - /question/:id         │
        │  - /run-java             │
        │  - /profile              │
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
    │ - Problems  │        │ - Sandbox    │
    │ - Submissions        │ - Execution  │
   └─────────────┘        └──────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Radix UI, Framer Motion |
| **Code Editor** | CodeMirror 6 with syntax highlighting for Java |
| **Authentication** | Firebase (Google OAuth 2.0) |
| **State Management** | Redux Toolkit |
| **Backend** | Node.js 18+ (ESM), Express.js |
| **Database** | MongoDB Atlas with Mongoose ODM |
| **Code Execution** | Docker (Eclipse Temurin 11 JDK) with sandboxed environment |
| **Charts & Graphs** | Chart.js, React Heat Map for contribution tracking |
| **UI Components** | Radix UI, Lucide React Icons |
| **Frontend Hosting** | Vercel |
| **Backend Hosting** | Linux VM (AWS, DigitalOcean, etc.) |
| **Rate Limiting** | express-rate-limit (app-level) + Nginx limit_req (reverse proxy) |
| **Process Manager** | PM2 (optional but recommended for production) |

---

## Project Structure

```
AlgoJunction/
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
│   │   ├── routes/
│   │   │   └── routes.js            # All API route definitions + health check
│   │   ├── controllers/             # Business logic
│   │   │   ├── runJavaController.js # Docker sandbox code execution
│   │   │   ├── questionsController.js
│   │   │   └── profileController.js
│   │   ├── db/                      # Database connection & models
│   │   │   ├── connectDb.js         # MongoDB connection
│   │   │   ├── data.js              # Static problem seed data
│   │   │   ├── mongooseClient.js    # Mongoose CRUD operations
│   │   │   ├── schema/
│   │   │   │   └── dbSchema.js      # Mongoose schemas (User, Submission)
│   │   │   └── utils/
│   │   │       └── formatDate.js    # Date formatter (YYYY/MM/DD)
│   │   ├── docker/
│   │   │   └── Dockerfile           # Eclipse Temurin 11 JDK image
│   │   ├── execute/                 # Solution.java written per execution
│   │   ├── inputs/                  # Test input.txt written per test case
│   │   └── scripts/
│   │       └── dbTransactions.js    # MongoDB seed/test script
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
└── .gitignore
```

### Key Directories Explained

- **`client/src/components/ui/`**: Reusable UI components (Button, Card, Tabs, etc.) — shadcn-style
- **`client/src/lib/pages/`**: Route-connected page components (auth, home, landing, problem, profile, error)
- **`client/src/lib/features/`**: Redux Toolkit slices (questions, totalques)
- **`client/src/lib/component/`**: Shared app-level components (Header, progress)
- **`server/routes/`**: API endpoint definitions
- **`server/controllers/`**: Logic for handling requests
- **`server/docker/`**: Dockerfile for the pre-built Java execution image
- **`server/db/`**: MongoDB connection, Mongoose schemas, CRUD operations, and static problem data
- **`server/nginx/`**: Nginx reverse proxy configuration for production

---

## Prerequisites

| Tool | Required for | Version |
|---|---|---|
| **Node.js** | Both frontend & backend | ≥ 18 |
| **Yarn** | Package management | Latest |
| **Docker** | Backend (Java code execution) | Latest |
| **MongoDB Atlas account** | Backend database | Free tier ok |
| **Firebase project** | Frontend authentication | Free tier ok |
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
# Edit server/.env and add your MongoDB URI
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

#### 4. Open in Browser
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

**Example:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xyz.mongodb.net/algojunction?retryWrites=true&w=majority
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

**Example:**
```
VITE_BACKEND_URL=http://localhost:3000
VITE_FIREBASE_API_KEY=AIzaSyDxxx...
VITE_FIREBASE_AUTH_DOMAIN=algojunction.firebaseapp.com
# ... etc
```

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

**Expected output:**
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:5173/
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment

Both deployment scripts are located at the repository root.

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

**Result:**
- Frontend URL: `https://algojunction.vercel.app` (or your custom domain)

### Deploy Backend → VM / Server

```bash
./deploy-server.sh
```

**What it does:**
1. Checks Docker is installed
2. Checks that `server/.env` exists
3. Runs `yarn install --frozen-lockfile`
4. Starts with **PM2** if installed (process name: `algojunction-server`), otherwise falls back to `node src/index.js`

**Recommended VM Setup (e.g., DigitalOcean, AWS EC2, Linode):**

```bash
# On your VM, run:
sudo apt update && sudo apt install -y nodejs npm docker.io

# Install Yarn
npm i -g yarn

# Install PM2 (recommended)
npm i -g pm2

# Clone the repo
git clone https://github.com/sumansahoo1/AlgoJunction.git
cd AlgoJunction

# Set up environment
cp server/.env.example server/.env
# Edit server/.env with production MongoDB URI
nano server/.env

# Deploy
./deploy-server.sh

# Start PM2 on system boot (optional)
pm2 startup
pm2 save
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
| `GET` | `/` | Health check | No |
| `GET` | `/questions` | Full question list with details and boilerplate | No |
| `GET` | `/questionlist` | Minimal list (id + title) for quick loading | No |
| `GET` | `/question/:id` | Single question by ID with description | No |
| `GET` | `/totalquestions` | Total count of available problems | No |
| `POST` | `/run-java` | Compile and run submitted Java code in Docker | Yes |
| `GET` | `/profile?username=&email=` | User profile with submission history and stats | No |

### Rate Limits

| Endpoint | Limit | Layer |
|---|---|---|
| All | 100 req/min/IP | Express (global) |
| `POST /run-java` | 5 req/min/IP | Express |
| `GET /profile` | 20 req/min/IP | Express |
| `GET /questions*` | 60 req/min/IP | Express |
| All | 30 req/s burst 20 | Nginx (reverse proxy) |

When a rate limit is hit, the API responds with `429 Too Many Requests` and a JSON error body.

### `POST /run-java` Request Body

```json
{
  "quesid": "1",
  "javaCode": "public class Solution {\n    public static void main(String[] args) {\n        System.out.println(\"Hello\");\n    }\n}",
  "username": "john_doe",
  "email": "john@example.com"
}
```

### `POST /run-java` Response

**Success (200):**
```json
{
  "success": true,
  "output": "Output from code execution",
  "error": null,
  "executionTime": "145ms",
  "submissionId": "507f1f77bcf86cd799439011"
}
```

**Error (400):**
```json
{
  "success": false,
  "output": "",
  "error": "Compilation error: ...",
  "executionTime": "0ms"
}
```

### `GET /profile` Response

```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "totalSubmissions": 42,
  "solvedProblems": 18,
  "submissions": [
    {
      "problemId": "1",
      "problemTitle": "Two Sum",
      "status": "accepted",
      "submittedAt": "2025-04-15T10:30:00Z",
      "executionTime": "125ms"
    }
  ],
  "contributionGraph": [
    { "date": "2025-04-15", "count": 2 },
    { "date": "2025-04-14", "count": 1 }
  ]
}
```

---

## Environment Variables Reference

### `server/.env`

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
PORT=3000
NODE_ENV=production
```

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
| **Total Problems** | 4 DSA problems (expandable via data.js) |
| **Supported Languages** | Java (C++, Python planned) |
| **Average Execution Time** | < 200ms per test case |
| **Database Response Time** | < 50ms |
| **Code Editor Load Time** | < 1.5s |
| **Deployment Time** | Frontend: 2-5 min, Backend: 3-10 min |
| **Monthly Active Users** | Tracking enabled via Firebase |

### Infrastructure

- **Frontend**: Deployed on Vercel (CDN-enabled, global edge locations)
- **Backend**: Linux VM with Docker for isolated execution
- **Database**: MongoDB Atlas (multi-region support)
- **Code Execution**: Pre-built Docker image (Eclipse Temurin 11) with per-test-case volume mounts, 10s timeout

---

## Future Enhancements & Roadmap

### Phase 2 (Q2 2026)
- [ ] **Support for C++ and Python** - Add CodeMirror language packs and Docker images
- [ ] **Problem Difficulty Filter** - Filter by Easy/Medium/Hard
- [ ] **Topic-Based Categories** - Browse by Arrays, Trees, Graphs, DP, etc.
- [ ] **Leaderboard** - Rank users by problems solved and submission speed
- [ ] **Discussion Forum** - Per-problem discussions and hints

### Phase 3 (Q3 2026)
- [ ] **Test Case Customization** - Users can add custom test cases
- [ ] **Code Template Library** - Starter templates for common patterns
- [ ] **Achievements & Badges** - Gamification (7-day streak, 100 problems solved, etc.)
- [ ] **Estimated Time Complexity** - AI-powered suggestions for optimization
- [ ] **Mobile App** - React Native version for iOS/Android

### Phase 4 (Q4 2026)
- [ ] **Team Competitions** - Collaborative contests
- [ ] **Mock Interviews** - Timed challenges with randomized problems
- [ ] **Problem Suggestions** - ML-based recommendations based on user history
- [x] **API Rate Limiting & Quotas** — express-rate-limit (app) + Nginx limit_req (reverse proxy)
- [ ] **Advanced Analytics** - Detailed performance breakdown

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
- Write clear, descriptive commit messages
- Test your changes locally before submitting a PR
- Update documentation if you change functionality
- Ensure no console errors or warnings in your changes

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

### What you can do:
✅ Use this project for personal projects  
✅ Modify and distribute derivatives  
✅ Use commercially  

### What you must do:
⚠️ Include a copy of the license  
⚠️ State significant changes  

---

## Support & Contact

- 🌐 **Live Website**: [algojunction.sumansahoo.com](https://algojunction.sumansahoo.com)
- 📧 **Email**: [contact@sumansahoo.com](mailto:contact@sumansahoo.com)
- 🐛 **Issues**: [GitHub Issues](https://github.com/sumansahoo1/AlgoJunction/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/sumansahoo1/AlgoJunction/discussions)

---

## Acknowledgments

- **CodeMirror** - Powerful code editor
- **Firebase** - Authentication and backend services
- **MongoDB** - NoSQL database
- **Docker** - Containerization and sandboxing
- **Vercel** - Frontend hosting platform
- **Radix UI** - Accessible component library
- **React** & **TypeScript** - Frontend framework and type safety

---

**Made with ❤️ by [Suman Sahoo](https://github.com/sumansahoo1)**

⭐ If you find this project helpful, please consider giving it a star on GitHub!