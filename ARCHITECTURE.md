# AlgoJunction — Architecture

This document describes the system architecture, data flow, and key design decisions.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client (Vercel)                            │
│  React 18 + TypeScript + Vite + Tailwind + Radix UI + Framer Motion │
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
                         HTTP / JSON
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   Backend (Linux VM + PM2)                           │
│                 Node.js (ESM) + Express, port 3000                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Express Router                                              │   │
│  │  GET  /              → Health check                          │   │
│  │  GET  /questions     → getAllQuestions (from data.js)        │   │
│  │  GET  /questionlist  → Minimal list (id, name, difficulty)   │   │
│  │  GET  /question/:id  → getQuestionById                       │   │
│  │  GET  /totalquestions → Total problem count                  │   │
│  │  POST /run-java      → runJava (Docker sandbox)              │   │
│  │  GET  /profile       → getProfileDetails (MongoDB)           │   │
│  │         ?username=&email=                                    │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                           │                                          │
│             ┌─────────────┴─────────────┐                            │
│             ▼                           ▼                            │
│  ┌──────────────────┐      ┌──────────────────────┐                 │
│  │  MongoDB Atlas    │      │  Docker (OpenJDK 11) │                 │
│  │  Database:        │      │  Sandboxed Java      │                 │
│  │  algojunction     │      │  Execution           │                 │
│  │  ─ users          │      │                      │                 │
│  │  ─ submissions    │      │  Build → Run →       │                 │
│  │                   │      │  Capture stdout      │                 │
│  └──────────────────┘      └──────────────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Routing

Routes are defined in `client/src/App.tsx` using `createBrowserRouter` (React Router v6):

| Path | Component | Purpose |
|---|---|---|
| `/` | `Landing` | Landing page / redirect |
| `/home` | `HomePage` | Problem list (table) |
| `/problem/:id` | `Problem` | Code editor + problem description + console |
| `/signin` | `SignIn` | Google OAuth sign-in |
| `/profile` | `ProfilePage` | User stats + submission history + contribution graph |
| `*` | `Error` | 404 fallback |

### 2.2 Component Structure (Problem Page)

The Problem page at `client/src/lib/pages/problem/problem.tsx` is the most complex view. It uses `react-resizable-panels` for a split layout:

```
Problem
├── Header                  (client/src/lib/component/Header.tsx)
├── ProblemDesc (left)      (client/src/lib/pages/problem/components/problemdesc.tsx)
│   └── Renders question description, examples, constraints via react-markdown
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
  submission?: { submitted: boolean; cases: Example[] };
}
```

### 2.4 Code Editor & Persistence

- **Editor**: `@uiw/react-codemirror` with `@codemirror/lang-java` extension.
- **Persistence**: User code is saved to `localStorage` keyed by problem ID (`localStorage.setItem(String(id), value)`).
- **Reset**: Clears the localStorage key for that problem and restores the boilerplate from `question.code`.
- **Theme toggle**: Light/dark CodeMirror themes (`dracula` / `quietlight`).

### 2.5 Authentication Flow (Firebase Google OAuth)

```
1. User clicks "Sign In" → Google Auth popup (signInWithPopup)
2. On success:
   - Store in localStorage: token, username, email, photoURL
3. Problem page checks localStorage for auth tokens
   - Missing → redirect to /signin
4. Sign Out: clears localStorage keys → redirects to /
```

Note: The backend (profile endpoint) receives `username` and `email` as query params, but **does not validate the Firebase token server-side** — user identity is trust-based from localStorage.

---

## 3. Backend Architecture

### 3.1 Server Entry

`server/src/index.js`:
- Express app on port 3000
- CORS enabled
- JSON body parsing
- MongoDB connection via `connectDB()`
- Routes from `routes/routes.js`

### 3.2 API Controllers

| Controller | File | Logic |
|---|---|---|
| `questionsController` | `server/src/controllers/questionsController.js` | Reads from `db/data.js` (in-memory array). No DB query for problems. |
| `runJavaController` | `server/src/controllers/runJavaController.js` | Writes code to `execute/Solution.java` → builds Docker image → runs container → captures output → saves submission to MongoDB |
| `profileController` | `server/src/controllers/profileController.js` | Queries MongoDB for user submissions, computes stats |

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
  userId: String,
  questionId: String,
  code: String,
  language: String,
  submissionTime: Date,
  result: { status, output, error },
  testCaseResults: [{ testCaseId, status, output }]
}
```

### 3.4 Problem Data Source

Problems are stored in `server/src/db/data.js` as a static array of ~100+ questions. Each question contains:
- `id`, `qName`, `qDifficulty`, `qDescription`, `qAssumptions`
- `examples[]` (display-friendly I/O for the UI)
- `inputs[]` (raw test inputs consumed by the Docker-executed Java code)
- `constraints`, `code` (boilerplate with `main` method + I/O scaffolding)

This means:
- Problem data does NOT go through MongoDB — it's served directly from memory
- The same seed file is used in `dbTransactions.js` for populating the DB

---

## 4. Code Execution Pipeline (Docker Sandbox)

This is the most architecturally significant subsystem. The entire flow:

```
User clicks "Run" in Console
        │
        ▼
1. POST /run-java  { quesid, javaCode, username, email }
        │
        ▼
2. Write javaCode → server/src/execute/Solution.java  (overwrites previous)
        │
        ▼
3. For each test case in questions[quesid].inputs[]:
        │
        ├─ 3a. Write raw input string → server/src/inputs/input.txt
        │
        ├─ 3b. docker build -t your-image-name -f Dockerfile .
        │       Dockerfile: FROM openjdk:11
        │                   COPY Solution.java /app/
        │                   RUN javac Solution.java
        │                   CMD ["java", "-cp", "/app", "Solution"]
        │
        ├─ 3c. docker run --rm -v inputs:/app/inputs your-image-name
        │       Solution.java reads from ./inputs/input.txt via Scanner
        │       Outputs result to stdout
        │
        ├─ 3d. Capture stdout, stderr
        │
        └─ 3e. Collect: { input, output, error, builderror }
        │
        ▼
4. Save submission to MongoDB:
        ├─ insertNew() → creates Submission document
        └─ addOrUpdateUser() → appends submission ID to user.submissions[]
        │
        ▼
5. Return array of test case results to frontend
        │
        ▼
6. Console renders each case:
        ├─ Green checkmark if output matches expected
        └─ Red X if it doesn't
```

### Key characteristics:

- **Not production-ready**: The Docker image is rebuilt for every test case (3b inside the loop). This is slow — each iteration rebuilds the entire image even though only `input.txt` changes. A production version would compile once and run the container multiple times with different input volumes.
- **No container cleanup**: `docker run` without `--rm` would accumulate stopped containers. The code does not include cleanup logic.
- **Overwrite vulnerability**: `Solution.java` is written to the host filesystem from user-submitted code, then baked into the Docker image. While Docker provides some isolation at runtime, the host write is a risk surface.
- **Auth**: The `/run-java` route accepts any `username`/`email` from the request body — there is no server-side token validation.

---

## 5. Profile & Progress Tracking

The profile page (`/profile`) queries the backend via `GET /profile?username=&email=`:

```
Frontend                              Backend
   │                                     │
   │  GET /profile?username=X&email=Y    │
   │────────────────────────────────────▶│
   │                                     │
   │  ┌─ 1. getUserByUsernameAndEmail()  │
   │  │   → Find User by email           │
   │  │                                    │
   │  ├─ 2. getSubmissionsDetails()       │
   │  │   → Populate user.submissions[]   │
   │  │                                    │
   │  └─ 3. Compute:                      │
   │       dates[]      (submission dates │
   │                     formatted as     │
   │                     YYYY/MM/DD)      │
   │       solvedques   (unique question  │
   │                     IDs across all   │
   │                     submissions)     │
   │       totalques    (from data.js)    │
   │       submissions[] (for history     │
   │                     table)           │
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

### Frontend (Vercel)

`deploy-client.sh`:
1. Check `client/.env` exists
2. `yarn install --frozen-lockfile`
3. `yarn build` → outputs to `client/dist/`
4. `vercel --prod`

Vite config: Root directory is `client/`, all `VITE_*` env vars configured in Vercel dashboard.

### Backend (Linux VM)

`deploy-server.sh`:
1. Check Docker is installed (required for code execution)
2. Check `server/.env` exists
3. `yarn install --frozen-lockfile`
4. Start via PM2 (`pm2 start src/index.js --name algojunction-server`)
5. PM2 saves process list for auto-restart on reboot

**Prerequisites on VM**: Node.js 18+, Docker, PM2.

---

## 7. Data Flow Diagrams

### 7.1 Problem Solving Flow

```
User visits /problem/1
        │
        ├─ Auth check: localStorage has token? No → redirect /signin
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
        │   └─ POST /run-java → Docker pipeline → results back
        │
        └─ Console renders case tabs with expected vs actual output
```

### 7.2 Submission Storage Flow

```
POST /run-java (backend)
        │
        ├─ Run all test cases via Docker
        │
        ├─ insertNew(userId, questionId, code, lang, result, testCaseResults)
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
| **Problems in static JS array** (`data.js`) | Fast, no DB round-trip, simple to edit | Requires server restart to add/modify problems; won't scale to user-generated problems |
| **Docker rebuild per test case** | Simple implementation | ~10-15s per test case; wasteful rebuild of same image |
| **localStorage for auth tokens** | No auth library needed, simple | Not secure; any XSS exposes tokens; backend doesn't verify Firebase token |
| **Firebase Admin SDK not used server-side** | Keeps backend simple | Backend trusts client-provided username/email without verification |
| **MongoDB Atlas (M0 free tier)** | Zero ops, free | 512MB storage limit, shared vCPU, throttled under load |
| **Vite + Vercel** | Fast builds, generous free tier, zero-config deployment | Vercel serverless functions not used (backend is separate VM) |
| **CodeMirror 6** | Extensible, lightweight, good syntax highlighting | No built-in AI autocomplete; custom keybindings require manual setup |
| **PM2 on VM** | Simple process management, auto-restart | No container orchestration; scaling requires manual work |
| **react-resizable-panels** | Professional split-pane layout | Added dependency; mobile UX needs separate consideration |

---

## 9. Future Considerations

- **Token validation server-side**: Verify Firebase ID tokens on `/run-java` and `/profile` using Firebase Admin SDK for proper auth.
- **Docker optimization**: Compile once, run many — mount `input.txt` as a volume instead of rebuilding the image per test case.
- **C++/Python support**: Language selection is already wired in the editor dropdown (disabled). Would need Docker images for each language.
- **Database-backed problems**: Migrate from `data.js` to MongoDB for dynamic problem management.
- **WebSocket for execution logs**: Stream real-time execution output instead of waiting for the full pipeline to finish.
- **Rate limiting**: Protect `/run-java` from abuse (expensive Docker builds).
- **Automated tests for correctness**: Parse and compare stdout against expected outputs more robustly.
