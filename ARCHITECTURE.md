# AlgoJunction — Architecture

This document describes the system architecture, data flow, and key design decisions.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Vercel)                            │
│  React 18 + TypeScript + Vite + Tailwind + shadcn/ui + Framer Motion│
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────────┐ │
│  │ Landing  │  │  Home    │  │ Problem  │  │      Profile       │ │
│  │  Page    │  │  (Table) │  │ (Editor) │  │ (Stats + History)  │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────────┘ │
│         ▲            ▲              ▲                ▲             │
│         └────────────┴──────┬───────┴────────────────┘             │
│                              │ HTTP (axios)                         │
│                              ▼                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Firebase Auth (Google OAuth 2.0) ← Popup → Google           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                  HTTP / JSON (+ Bearer Token)
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Backend (Oracle VM + PM2)                           │
│                 Node.js (ESM) + Express, port 3000                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express Router                                              │   │
│  │  GET  /              → Health check                          │   │
│  │  GET  /questions     → getAllQuestions (MongoDB)             │   │
│  │  GET  /questionlist  → Minimal list (id, name, difficulty)   │   │
│  │  GET  /question/:id  → getQuestionById (MongoDB)             │   │
│  │  GET  /totalquestions → Total problem count (MongoDB)        │   │
│  │  GET  /questions/solved → Solved IDs (Submission collection) │   │
│  │  POST /run-java      → runJava (Docker sandbox)    [Auth]    │   │
│  │  GET  /profile       → getProfileDetails (MongoDB) [Auth]    │   │
│  │  POST /admin/questions    → createQuestion         [Admin]   │   │
│  │  PUT  /admin/question/:id → updateQuestion         [Admin]   │   │
│  │  DELETE /admin/question/:id → deleteQuestion       [Admin]   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           │                                          │
│             ┌─────────────┴─────────────┐                            │
│             ▼                           ▼                            │
│  ┌──────────────────┐      ┌────────────────────────┐                 │
│  │  MongoDB Atlas    │      │  Docker                │                 │
│  │  Database:        │      │  (Eclipse Temurin 11)  │                 │
│  │  algojunction     │      │  Sandboxed Java         │                 │
│  │  ─ users          │      │  Execution              │                 │
│  │  ─ submissions    │      │                         │                 │
│  │  ─ questions      │      │  javac → timeout java →  │                 │
│  │                   │      │  Capture stdout         │                 │
│  └──────────────────┘      └────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Routing

Routes are defined in `client/src/App.tsx` using `createBrowserRouter` (React Router v6):

| Path | Component | Purpose |
|---|---|---|
| `/` | `Landing` | Landing page |
| `/home` | `HomePage` | Problem list (table with Solved badges) |
| `/problem/:id` | `Problem` | Code editor + problem description + console |
| `/signin` | `SignIn` | Google OAuth sign-in |
| `/profile` | `ProfilePage` | User stats + submission history + contribution graph |
| `*` | `Error` | 404 fallback |

### 2.2 Component Structure (Problem Page)

The Problem page at `client/src/lib/pages/problem/problem.tsx` uses `react-resizable-panels` for a split layout:

```
Problem
├── Header                  (client/src/lib/component/Header.tsx)
├── ProblemDesc (left)      (renders description, examples, constraints)
└── Editor (right)          (client/src/lib/pages/problem/components/editor.tsx)
    └── CodeMirror 6 (Java) with dark/light theme, reset, localStorage persistence
└── Console (bottom)        (client/src/lib/pages/problem/components/console.tsx)
    ├── Case tabs (per example/test case)
    ├── Expected vs Actual output comparison
    └── Run button → POST /run-java
```

### 2.3 State Management (Redux Toolkit)

Two slices defined in `client/src/lib/features/`:

| Slice | State | Actions |
|---|---|---|
| `questions` | `Question[]` (loaded on demand per problem page) | `addQues`, `addSubmission` |
| `totalques` | `number` (total problem count) | `addTotalQues` |

The `Question` interface (`client/src/lib/utils.ts`):
```typescript
interface Question {
  id: number;
  qName: string;
  qDifficulty: string;
  qDescription: string;
  examples: Example[];    // Display examples
  inputs: Example[];      // Raw test inputs for Docker
  constraints: string;
  code: string;            // Boilerplate Java code
  submission?: { submitted: boolean; cases: TestCaseResult[] };
}
```

### 2.4 Code Editor & Persistence

- **Editor**: `@uiw/react-codemirror` with `@codemirror/lang-java` extension.
- **Persistence**: User code is saved to `localStorage` keyed by problem ID (`localStorage.setItem(String(id), value)`).
- **Reset**: Clears the localStorage key and restores the boilerplate from `question.code`.
- **Theme toggle**: Light/dark CodeMirror themes (`dracula` / `quietlight`).

### 2.5 Authentication Flow (Firebase Google OAuth + Server-Side Verification)

```
1. User clicks "Sign In" → Google Auth popup (signInWithPopup)
2. On success:
   - result.user.getIdToken() → stored as "idToken" in localStorage
   - username, email, photoURL also stored for UI display
3. Each protected API request sends:
   Authorization: Bearer <idToken>
4. Server middleware (auth.js) verifies the token:
   admin.auth().verifyIdToken(idToken) → extracts uid, email, name
5. Server uses verified identity from the token — NEVER trusts
   client-provided username/email fields in the request body
6. On 401 response → localStorage cleared → redirect to /signin
```

**Important:** Firebase ID tokens expire after 1 hour. The Firebase Auth SDK auto-refreshes them in the background, but the frontend currently does not listen for refreshed tokens via `onIdTokenChanged`. This means after ~1 hour in production, API calls will return 401 and trigger sign-out. See the "Future Considerations" section.

---

## 3. Backend Architecture

### 3.1 Server Entry

`server/src/index.js`:
- Express app on port 3000
- CORS enabled (allowlist: `localhost:5173`, `algojunction.sumansahoo.com`)
- `app.set('trust proxy', 1)` — reads real client IP from X-Forwarded-For
- JSON body parsing
- Global rate limit: 100 req/min/IP (express-rate-limit)
- MongoDB connection via `connectDB()` with retry logic (max 5 attempts)
- Connection state listeners for `connected`, `disconnected`, `reconnected`, `error` events
- Routes from `routes/routes.js`

### 3.2 API Controllers

| Controller | File | Logic |
|---|---|---|
| `questionsController` | `server/src/controllers/questionsController.js` | Queries MongoDB `Question` collection. All handlers are async. |
| `questionAdminController` | `server/src/controllers/questionAdminController.js` | Admin CRUD: creates, updates, deletes questions in MongoDB. Protected by `authenticate` + `requireAdmin`. |
| `runJavaController` | `server/src/controllers/runJavaController.js` | Fetches question from MongoDB, writes code to `execute/Solution.java`, runs in Docker container, captures output, saves submission to MongoDB |
| `profileController` | `server/src/controllers/profileController.js` | Queries MongoDB for user submissions, resolves question names from DB, computes stats |

### 3.3 Database Schema (MongoDB Atlas)

Database: `algojunction` (`server/src/db/schema/dbSchema.js`)

**User collection:**
```javascript
{
  username: String,
  email: String,
  submissions: [ObjectId]  // ref: Submission
  createdAt: Date,
  updatedAt: Date          // auto-updated via pre-save hook
}
```

**Submission collection:**
```javascript
{
  userId: String,          // username from Firebase token
  questionId: String,      // numeric question id
  code: String,
  language: String,
  submissionTime: Date,
  result: { status, output, error },
  testCaseResults: [{ testCaseId, status, output }]
}
```

**Question collection:**
```javascript
{
  id: Number,              // numeric id (unique, separate from _id)
  qName: String,
  qDifficulty: String,     // 'Easy' | 'Medium' | 'Hard'
  qDescription: String,
  qAssumptions: String,
  examples: [{ input: String, output: String }],
  inputs: [{ input: String, expectedOutput: String }],
  constraints: String,
  code: String,            // Java boilerplate
  createdAt: Date,         // auto (timestamps: true)
  updatedAt: Date          // auto (timestamps: true)
}
```

The `toJSON` transform strips `_id` and `__v` from API responses, keeping the output shape identical to the old static array.

### 3.4 Question Management

Questions are stored in MongoDB and served via the `Question` model. The old `data.js` file is deprecated and retained only as a seed reference.

**Adding questions:**
- Via admin API: `POST /admin/questions` (requires Firebase auth + admin email)
- Via MongoDB Atlas UI directly
- No server restart needed

**One-time seed:** Run `node src/scripts/seedQuestions.js` after the first deploy to migrate the 4 original problems from `data.js` into MongoDB. The script is idempotent (uses `findOneAndUpdate` with `upsert: true`).

### 3.5 Authentication & Authorization

**Firebase ID token verification** (`middleware/auth.js`):
- Extracts `Bearer <token>` from Authorization header
- Verifies via `admin.auth().verifyIdToken(idToken)`
- Sets `req.user = { uid, email, name, picture }`
- Returns 401 on invalid/expired tokens

**Admin authorization** (`middleware/adminAuth.js`):
- Runs after `authenticate` middleware
- Checks `req.user.email` against `ADMIN_EMAILS` env var (comma-separated allowlist)
- Returns 403 if email is not in the allowlist

**Firebase Admin SDK** (`config/firebaseAdmin.js`):
- Lazy initialization — only created on first API call
- Parses `FIREBASE_SERVICE_ACCOUNT_BASE64` env var at init time
- This lazy pattern keeps CI smoke tests fast (they import routes but never call auth)

---

## 4. Code Execution Pipeline (Docker Sandbox)

### 4.1 Pre-Built Docker Image

The image is built once from `server/src/docker/Dockerfile`:

```dockerfile
FROM eclipse-temurin:11-jdk
RUN groupadd -r runner && useradd -r -g runner runner
USER runner
WORKDIR /app
```

Key properties:
- Eclipse Temurin 11 JDK (not OpenJDK)
- Runs as non-root `runner` user for security
- No application code baked into the image — code is volume-mounted at runtime
- Built once via `docker build -t algojunction-java-executor server/src/docker`

### 4.2 Execution Flow

```
User clicks "Run" in Console
        │
        ▼
1. POST /run-java  { quesid, javaCode }
   Authorization: Bearer <firebase-id-token>
        │
        ▼
2. Server verifies token, extracts username/email
        │
        ▼
3. Fetch question from MongoDB: getQuestionByIdFromDB(quesid)
        │
        ▼
4. Create temp dir: tmp/algojunction-{timestamp}-{random}
   └─ Create subdirectory: tmp/.../inputs/
        │
        ▼
5. Write user's javaCode → tmp/.../Solution.java
        │
        ▼
6. For each test case in question.inputs[]:
        │
        ├─ 6a. Write raw input → tmp/.../inputs/input.txt
        │
        ├─ 6b. docker run --rm (pre-built algojunction-java-executor image)
        │       Volume mount: -v tmp/.../:/app
        │       Working dir: -w /app
        │       Command: sh -c "javac Solution.java 2>&1 && timeout --signal=KILL 10s java Solution"
        │       Resource limits:
        │         --cpus="0.5" --memory="512m" --memory-swap="512m"
        │         --pids-limit="64" --read-only
        │         --tmpfs /tmp:rw,noexec,nosuid,size=128m
        │         --network none
        │         --cap-drop=ALL --security-opt=no-new-privileges:true
        │         --ulimit nproc=64:64 --ulimit nofile=256:256
        │
        ├─ 6c. Solution.java reads ./inputs/input.txt via Scanner
        │       Outputs result to stdout
        │
        ├─ 6d. Capture stdout, compare with expectedOutput
        │
        └─ 6e. Exit code mapping:
                124 → "Time Limit Exceeded"
                137 → "Memory Limit Exceeded"
                Other → stderr/stdout message
        │
        ▼
7. Save submission to MongoDB:
        ├─ insertNew() → creates Submission document
        └─ addOrUpdateUser() → appends submission ID to user.submissions[]
        │
        ▼
8. Cleanup: await fs.rm(tempDir, { recursive: true, force: true })
        │
        ▼
9. Return array of test case results to frontend
        │
        ▼
10. Console renders each case:
        ├─ Green checkmark if output matches expected
        └─ Red X if it doesn't
        └─ Red compilation error banner if all cases share the same error
```

### 4.3 Key Design Decisions

- **Single pre-built image**: The Docker image contains only the JDK, not user code. Code is injected via volume mount at runtime — no image rebuild per test case.
- **Compilation per test case**: `javac` runs inside the container per test case (~1-2s overhead). Could be optimized to compile once per submission.
- **`--rm` flag**: Containers auto-removed after execution — no accumulation of stopped containers.
- **Security hardening**: No network access, read-only root filesystem, dropped Linux capabilities, PID and process limits, memory and CPU caps, 10-second hard timeout.
- **Temp directory lifecycle**: Created per request, cleaned up in `finally` even if execution fails. Randomized names to avoid collisions.

---

## 5. Profile & Progress Tracking

The profile page (`/profile`) queries the backend via `GET /profile` with a Bearer token:

```
Frontend                              Backend
   │                                     │
   │  GET /profile                        │
   │  Authorization: Bearer <token>       │
   │────────────────────────────────────▶│
   │                                     │
   │  ┌─ 1. verifyIdToken → extract      │
   │  │   username, email from token      │
   │  │                                    │
   │  ├─ 2. getUserByUsernameAndEmail()   │
   │  │   → Find User by email in MongoDB  │
   │  │                                    │
   │  ├─ 3. getSubmissionsDetails()       │
   │  │   → Populate user.submissions[]   │
   │  │                                    │
   │  ├─ 4. getQuestionNameById()         │
   │  │   → Resolve question names from DB│
   │  │   → Parallel lookups per submission│
   │  │                                    │
   │  └─ 5. Compute:                      │
   │       dates[]      (accepted sub     │
   │                     dates formatted  │
   │                     as YYYY/MM/DD)   │
   │       solvedques   (unique question  │
   │                     IDs accepted)    │
   │       totalques    (from MongoDB)    │
   │       submissions[] (with question   │
   │                     names)           │
   │                                     │
   │  Response: { dates, totalques,      │
   │  ◀────────  solvedques, submissions }│
   │                                     │
   ▼                                     ▼
   Profile UI renders:
   ├─ User avatar + name (from localStorage)
   ├─ Solved / Total stat card
   ├─ Contribution graph (@uiw/react-heat-map)
   │  (date → count heatmap)
   └─ Submission history table
```

---

## 6. Deployment Architecture

### 6.1 CI/CD Pipeline

**CI** (`.github/workflows/ci.yml`) — runs on push/PR to `main`:
- `client`: lint → `tsc` → `vite build`
- `server-lint`: ESLint
- `server-smoke`: `node --check` syntax check + `import('./src/routes/routes.js')` resolution check
- `docker`: builds `algojunction-java-executor` image

**CD** (`.github/workflows/cd-server.yml`) — auto-deploys after CI passes:
1. SSHs into Oracle VM via `appleboy/ssh-action`
2. `git pull origin main`
3. `yarn install --frozen-lockfile`
4. `docker build -t algojunction-java-executor`
5. `pm2 delete algojunction-server || true` → `pm2 start ecosystem.config.cjs` → `pm2 save`
6. Conditionally reloads nginx if `algojunction.conf` changed

Also supports `workflow_dispatch` for manual deployment.

### 6.2 Frontend (Vercel)

`deploy-client.sh`:
1. Check `client/.env` exists
2. `yarn install --frozen-lockfile`
3. `yarn build` → outputs to `client/dist/`
4. `vercel --prod`

Vite config: Root directory is `client/`, all `VITE_*` env vars in Vercel dashboard. `vercel.json` sets root to repo root, installs from `client/`.

### 6.3 Backend (Oracle VM)

`deploy-server.sh`:
1. Check Docker installed
2. Pre-build Java executor image
3. Check `server/.env` exists
4. `yarn install --frozen-lockfile`
5. PM2 start (or fallback to `node src/index.js`)

**First-time VM setup:**
```bash
sudo apt update && sudo apt install -y nodejs npm docker.io
npm i -g yarn pm2
git clone https://github.com/sumansahoo1/AlgoJunction.git
cd AlgoJunction
cp server/.env.example server/.env
# Edit server/.env with MONGODB_URI, FIREBASE_SERVICE_ACCOUNT_BASE64, ADMIN_EMAILS
./deploy-server.sh
# One-time: seed questions into MongoDB
cd server && node src/scripts/seedQuestions.js
pm2 startup && pm2 save
```

---

## 7. Data Flow Diagrams

### 7.1 Problem Solving Flow

```
User visits /problem/1
        │
        ├─ Auth check: localStorage has idToken? No → redirect /signin
        │
        ├─ Fetch /totalquestions → dispatch addTotalQues
        │
        ├─ Validate id in range 1..totalquestions
        │
        ├─ Fetch /question/1 → dispatch addQues → Redux store
        │
        ├─ LocalStorage has saved code for id=1?
        │   ├─ Yes → load saved code into editor
        │   └─ No  → load boilerplate (question.code)
        │
        ├─ User writes code → saved to localStorage onChange
        │
        ├─ User clicks "Run"
        │   └─ POST /run-java (with Bearer token) → Docker pipeline → results back
        │
        └─ Console renders case tabs with expected vs actual output
```

### 7.2 Submission Storage Flow

```
POST /run-java (backend)
        │
        ├─ verifyIdToken → extract username, email from token
        │
        ├─ getQuestionByIdFromDB(quesid) → get test inputs
        │
        ├─ Run all test cases via Docker
        │
        ├─ insertNew(username, quesid, javaCode, language, result, testCaseResults)
        │   └─ Creates Submission document in MongoDB
        │
        └─ addOrUpdateUser(username, email, submissionId)
            └─ Upserts User document
                ├─ New: creates with [submissionId]
                └─ Existing: pushes submissionId to submissions[]
```

---

## 8. Key Design Decisions & Trade-offs

| Decision | Rationale | Trade-off |
|---|---|---|
| **Questions in MongoDB** | Dynamic management, no server restart, admin API | Adds DB round-trip (~5ms) vs in-memory array |
| **Server-side token verification** | Proper security — identity from verified token, not client fields | Firebase Admin SDK dependency; tokens expire after 1h (needs `onIdTokenChanged` on frontend) |
| **Pre-built Docker image + volume mount** | No image rebuild per test case; fast execution | User code written to host filesystem; compilation still per-case |
| **Admin email allowlist** | Simple access control, no roles DB needed | Requires manual env var updates to add/remove admins |
| **MongoDB Atlas (M0 free tier)** | Zero ops, free | 512MB storage limit, shared vCPU, throttled under load |
| **Vite + Vercel** | Fast builds, generous free tier, zero-config deployment | Vercel serverless functions not used (backend is separate VM) |
| **CodeMirror 6 (Java only)** | Extensible, lightweight, good syntax highlighting | C++/Python disabled in UI; no AI autocomplete |
| **PM2 on VM** | Simple process management, auto-restart | No container orchestration; scaling requires manual work |
| **react-resizable-panels** | Professional split-pane layout | Added dependency; mobile UX needs separate consideration |
| **CI/CD via GitHub Actions** | Automated deploy on push to main, no manual SSH | VM SSH key management required |

---

## 9. Future Considerations

- **Token refresh handling**: Add `onIdTokenChanged` listener in the frontend to capture refreshed Firebase ID tokens before the 1-hour expiry, preventing unexpected sign-outs in production.
- **Docker optimization**: Compile once per submission, run container multiple times with different input volumes — avoid recompiling per test case.
- **C++/Python support**: Language selection is already wired in the editor dropdown (disabled). Would need Docker images for each language.
- **Admin UI**: Build a simple admin panel on the frontend for managing questions (currently only API-based).
- **WebSocket for execution logs**: Stream real-time execution output instead of waiting for the full pipeline to finish.
- **Tests**: Add unit and integration tests for both client and server.
- **Advanced Analytics**: Detailed performance breakdown, topic-based recommendations.
