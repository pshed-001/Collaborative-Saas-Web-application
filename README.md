# Collaborative SaaS Web Application

A full-stack team workspace and project management platform. Users create or join public/private workspaces, manage memberships and roles, create and assign tasks through a status workflow, and discuss work through threaded comments — all secured behind a JWT access/refresh authentication layer with Redis-backed rate limiting.

Built by **Albert / ITGEL** (Infinite Technology Global Enterprise Limited) as a portfolio-grade demonstration of backend architecture and application-security practice, layered on top of a polished React frontend.

> **Repository layout:** this is a monorepo with two independently-run packages — `backend/` (Node.js/Express API) and `client_side/` (React/Vite SPA) — served together in production from a single Express process.

---

## Table of Contents

1. [Project Status](#project-status)
2. [Feature Overview](#feature-overview)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Data Model](#data-model)
6. [API Reference](#api-reference)
7. [Security Design](#security-design)
8. [Frontend Design System](#frontend-design-system)
9. [Project Structure](#project-structure)
10. [Getting Started](#getting-started)
11. [Environment Variables](#environment-variables)
12. [Available Scripts](#available-scripts)
13. [Known Limitations & Roadmap](#known-limitations--roadmap)
14. [Codebase Stats](#codebase-stats)
15. [License](#license)

---

## Project Status

**MVP / active development.** The core platform — authentication, workspace lifecycle, membership management, task management, and threaded comments — is implemented end-to-end across both backend and frontend. Some secondary features (task attachments, per-task activity logs, forgot-password flow, a dedicated settings module) exist as scaffolding but are not yet implemented. See [Known Limitations & Roadmap](#known-limitations--roadmap) for the full breakdown.

| Area | Status |
|---|---|
| Auth (register/login/refresh/logout) | ✅ Implemented |
| Workspace CRUD + soft-delete/recovery | ✅ Implemented |
| Membership lifecycle (join/approve/reject/leave/remove/role update) | ✅ Implemented |
| Task CRUD, assignment, status workflow, soft-delete/recovery | ✅ Implemented |
| Threaded comments (2-level, soft delete) | ✅ Implemented |
| Rate limiting (Redis-backed, per-route) | ✅ Implemented |
| Frontend (all core pages, theming, forms) | ✅ Implemented |
| Maintenance-mode kill switch | ✅ Implemented |
| Task attachments | 🚧 Route stubs only |
| Per-task activity log | 🚧 Route stub only |
| Forgot-password flow | 🚧 Placeholder file, not built |
| Settings module | 🚧 Empty scaffold |
| Automated tests | ❌ Not present |
| CI/CD, Docker | ❌ Not present |

---

## Feature Overview

### Authentication
- Email/username + password registration and login
- Passwords hashed with **bcrypt** (configurable salt rounds via `SALT_ROUND`)
- **JWT access tokens** (15 min expiry, `HS256`) returned in the `Authorization` response header
- **JWT refresh tokens** (3 day expiry) stored in an `httpOnly`, `secure`, `sameSite=none` cookie scoped to `/api/auth`
- Silent token refresh on the frontend via an axios response interceptor that queues concurrent requests while a refresh is in flight
- Per-route Redis-backed rate limiting and progressive slow-down on login/register (see [Security Design](#security-design))

### Workspaces
- Create workspaces with a name, description, one or more categories (from a fixed taxonomy), and a `PUBLIC`/`PRIVATE` visibility mode
- Public workspaces are joinable instantly; private workspaces require admin approval of a `PENDING` membership request
- Workspace owner is automatically granted an `ACTIVE` `ADMIN` membership on creation
- Full membership lifecycle: join → pending/active → approve/reject → leave/remove → rejoin
- Guardrails: an owner cannot leave/be removed; the last active admin cannot leave or be removed (enforced via transaction + count check); admins cannot escalate their own role
- **Soft-delete + 30-day recovery window** for workspaces (cascades to memberships and tasks via transaction), plus a "trash" endpoint showing remaining time before permanent deletion
- Category-based discovery and filtering (`GET /api/workspace?category=...`)

### Tasks
- Nested under a workspace (`/api/workspace/:workspaceId/tasks`)
- Fields: title, description, due date, priority (`LOW`/`NORMAL`/`HIGH`), status, assignee, creator
- **Role-gated status transitions** — an explicit allow-list restricts which statuses an *assignee* (`IN_PROGRESS`, `COMPLETED`) vs. a *manager* (workspace admin or task creator: `COMPLETED`, `IN_REVIEW`, `IN_PROGRESS`, `REVIEWED`, `CANCELLED`, `TODO`) may set
- Assignment requires the assignee to be an active workspace member; cancelled/completed tasks cannot be reassigned
- Search (title/description, case-insensitive) and filter by status/priority
- Soft-delete with restore, and a per-workspace deleted-task listing
- Full audit trail of who created / updated / deleted / recovered / completed each task, captured via named Prisma relations

### Comments
- Nested under a task (`/api/workspace/:workspaceId/tasks/:taskId/comments`)
- **Two-level threading**: a reply to a top-level comment is depth 1; replies always attach to the thread's root (`parentId`) rather than nesting indefinitely, and record who is being replied to (`repliedUserId`)
- Soft-delete: deleted comments are returned with sanitized placeholder content/author (`"This comment was deleted"`, author shown as "Deleted User") rather than being removed from the thread
- Only the comment author can edit; the comment author or a workspace admin can delete

### Frontend Application
- Full SPA experience: landing page, auth (login/register), dashboard (my workspaces), discover (public workspaces), workspace detail (members + tasks + settings tabs), task detail (with threaded comments), trash (recoverable workspaces with live countdown), profile, 404, and a maintenance screen
- Client-side route guarding (`AuthGate` / `GuestGate`) with a splash screen while session restoration is in flight
- Optimistic-friendly data layer via **TanStack Query** with toast notifications on mutation success/error
- Light/dark theming with a system-preference default, persisted to `localStorage`, and a custom "Ocean Depths" teal/slate design token palette
- Route-based code splitting (`React.lazy`) with animated page transitions (Framer Motion) and skeleton loading states
- A small **shadcn-style, dependency-free UI kit** (button, card, dialog, dropdown, input, select, tabs, toast, avatar, badge, etc.) built with CSS Modules — no Radix or component-library dependency

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express **5** |
| ORM | Prisma **6** (`prisma-client` generator, custom output to `generated/prisma`) |
| Database | PostgreSQL (via `@prisma/adapter-pg` + `pg` connection pool) |
| Cache / Rate-limit store | Redis (`redis` client + `rate-limit-redis`) |
| Auth | `jsonwebtoken` (JWT access + refresh), `bcrypt` |
| Validation | `express-validator` |
| Security headers | `helmet` |
| CORS | `cors`, driven by `CLIENT_URL` |
| Rate limiting / throttling | `express-rate-limit`, `express-slow-down` |
| Logging | `winston` (file + console transports) |
| Cookies | `cookie-parser` |

### Frontend
| Layer | Technology |
|---|---|
| Library | React **19** |
| Build tool | Vite **8** (`@vitejs/plugin-react`) |
| Routing | `react-router-dom` v7 |
| Server-state / data fetching | `@tanstack/react-query` v5 |
| Client state | `zustand` (auth store, theme store) |
| Forms & validation | `react-hook-form` + `zod` (`@hookform/resolvers`) |
| HTTP client | `axios` (with token-refresh interceptor) |
| Animation | `framer-motion` |
| Icons | `lucide-react` |
| Styling | CSS Modules + a hand-rolled CSS custom-property design token system |
| Linting | ESLint 9 (flat config) |

---

## Architecture

```
                       ┌────────────────────────────┐
                       │        Browser (SPA)        │
                       │  React 19 + Vite + Zustand   │
                       └──────────────┬───────────────┘
                                      │ Axios (JWT Bearer + refresh cookie)
                                      ▼
                       ┌────────────────────────────┐
                       │        Express 5 API        │
                       │  helmet · cors · cookies    │
                       │  global slow-down + limiter │
                       └──────────────┬───────────────┘
                     ┌────────────────┼─────────────────┐
                     ▼                ▼                 ▼
              /api/auth        /api/workspace      /api/test
                     │                │
                     │        ┌───────┴────────┐
                     │        ▼                 ▼
                     │   nested /tasks    membership sub-routes
                     │        │
                     │        ▼
                     │   nested /comments
                     ▼
              ┌─────────────┐        ┌─────────────┐
              │   Prisma    │        │    Redis    │
              │  (pg pool)  │        │ (rate-limit │
              └──────┬──────┘        │   stores)   │
                     ▼                └─────────────┘
              ┌─────────────┐
              │ PostgreSQL  │
              └─────────────┘
```

### Request lifecycle (backend)
`server.js` boots via `loadApplication()`, which checks `MAINTENANCE_MODE`:
- If `"true"` → mounts **`maintenanceApp.js`**, a minimal Express app that responds `503` to every route (still behind `helmet` + `cors`).
- Otherwise → mounts **`mainApp.js`**, the real API: `helmet` → CORS (origins from `CLIENT_URL`) → static file serving of the built frontend (`client_side/dist`) → `cookie-parser` → JSON/urlencoded body parsing (10kb limit) → global slow-down → global rate limiter → routers (`/api/auth`, `/api/test`, `/api/workspace`) → SPA fallback (`GET *` → `index.html`) → centralized error handler.

### Modular structure
Each domain (`auth`, `workspace`, `task`, `comments`, `settings`) follows a consistent **routes → controller → service → validator** layering:
- **routes** wire HTTP verbs/paths to middleware chains (auth, rate limits, validators, controller)
- **controllers** are thin — they extract `req.user`/`req.params`/`req.body`, call the service, and shape the JSON envelope
- **services** hold business logic and Prisma calls, and throw `AppError` for expected failure cases
- **validators** are `express-validator` chains plus a shared `validateXResult` middleware that surfaces the first validation error

Tasks and comments are **nested resources** — `taskRouter` is mounted inside `workspaceRouter` at `/:workspaceId/tasks`, and `commentRouter` is mounted inside `taskRouter` at `/:taskId/comments`, both using `mergeParams: true` so nested `:workspaceId`/`:taskId` params flow down.

A shared **`workspacePermission.js`** middleware module centralizes cross-cutting authorization checks (`checkWorkspace`, `getMembership`, `validateUserAdmin`, `checkTask`, and a combined `taskRules` helper that resolves workspace + membership + task existence/authorization in parallel via `Promise.all`) so every module enforces the same rules consistently.

---

## Data Model

Defined in `backend/prisma/schema.prisma`, targeting PostgreSQL.

### Entities

**User**
- `id` (UUID), `firstname`, `lastname`, `username` (unique), `email` (unique), `password` (bcrypt hash)
- Soft-delete fields: `isDeleted`, `deletedAt`, `deletedBy` (enum: `OWNER` / `ACCOUNT_DELETION_REQUEST` / `BACKGROUND_JOB`)
- Owns many workspaces, memberships, created/assigned/completed tasks, and authored/replied/deleted comments — plus reverse relations for every audit action (`updatedWorkspaces`, `deletedTasks`, `recoveredTasks`, etc.)

**Workspace**
- `id`, `name`, `description`, `mode` (`PUBLIC` | `PRIVATE`), `category` (comma-separated string), `ownerId`
- Full audit trail: `updatedById`/`updatedByUser`, `deletedById`/`deletedByUser`, `recoveredById`/`recoveredByUser`, plus `createdAt`/`updatedAt`/`deletedAt`/`recoveredAt`
- `@@unique([name, ownerId])` — an owner can't have two workspaces with the same name (deleted workspaces retain their name, which surfaces a friendly conflict message on restore)

**Membership** (join table between User and Workspace)
- `role`: `ADMIN` | `MEMBER`
- `status`: `ACTIVE` | `INACTIVE` | `PENDING` | `REMOVED` | `REJECTED` | `LEFT`
- `@@unique([userId, workspaceId])`, indexed on `status` and `[workspaceId, status]` for fast membership lookups

**Task**
- `title`, `description`, `dueDate`, `priority` (`LOW`/`NORMAL`/`HIGH`), `status` (`TODO`/`IN_PROGRESS`/`IN_REVIEW`/`REVIEWED`/`CANCELLED`/`COMPLETED`)
- Relations: `workspace`, `createdBy`, `assignedTo` (optional), `completedBy` (optional), plus updated/deleted/recovered audit relations
- `@@unique([title, workspaceId, isDeleted])` — prevents duplicate active task titles per workspace while still allowing a soft-deleted task to coexist with a new task of the same name
- Indexed on `workspaceId`, `assignedToId`, `completedById`, `createdById`, `status`, `priority`, `dueDate`, `isDeleted`

**Comment**
- `content`, `depth` (0 or 1), soft-delete fields
- Self-referential: `parentId` → `parent`/`replies` (root-collapsed threading — see [Comments](#comments)), `repliedUserId` for @mention-style "replying to X" context
- Both self-relations use `onDelete: SetNull` so a comment isn't destroyed if the user it references is removed

### Entity-relationship summary

```
User ──1:N── Workspace (owner)
User ──1:N── Membership ──N:1── Workspace
User ──1:N── Task (created / assigned / completed)
Workspace ──1:N── Task
Task ──1:N── Comment
User ──1:N── Comment (author / repliedUser)
Comment ──1:N── Comment (replies, depth-capped at 1)
```

### Migrations
A single baseline migration exists: `prisma/migrations/20260720133854_init/migration.sql` (PostgreSQL provider, tracked via `migration_lock.toml`).

---

## API Reference

All routes are prefixed `/api`. Except where noted, workspace/task/comment routes require a valid `Authorization: Bearer <accessToken>` header (`authMiddleWare`, mounted globally on the workspace router).

### Auth — `/api/auth`

| Method | Path | Description | Extra middleware |
|---|---|---|---|
| POST | `/register` | Create a new user account | slow-down + IP/email/combined rate limiters |
| POST | `/login` | Authenticate with `userInput` (email or username) + `password`; sets refresh cookie, returns access token in `Authorization` header | slow-down + IP/identity/combined rate limiters |
| POST | `/refresh` | Rotate the refresh token (from cookie) and issue a new access token | — |
| POST | `/logout` | Clear the refresh cookie | — |

### Workspaces — `/api/workspace` (auth required)

| Method | Path | Description |
|---|---|---|
| GET | `/me` | Workspaces the current user belongs to (filterable by `category`) |
| GET | `/trash` | Current user's soft-deleted workspaces, with time remaining before permanent deletion |
| POST | `/` | Create a workspace (creator becomes `ADMIN`/`ACTIVE`) |
| GET | `/` | List public workspaces (filterable by `category`), annotated with the caller's membership status if any |
| POST | `/:workspaceId/join` | Join a public workspace instantly, or request access to a private one (`PENDING`) |
| GET | `/:workspaceId/members` | List active/pending members (requires existing, non-pending membership) |
| PATCH | `/:workspaceId/leave` | Leave a workspace (blocked for the owner, and for the last active admin) |
| PATCH | `/:workspaceId/recover` | Owner-only: restore a soft-deleted workspace within its 30-day window |
| DELETE | `/:workspaceId/permanent-delete` | Owner-only: hard-delete a workspace and its memberships/tasks |
| PATCH | `/:workspaceId/members/:targetUserId/approve` | Admin-only: approve a pending join request |
| PATCH | `/:workspaceId/members/:targetUserId/reject` | Admin-only: reject a pending join request |
| PATCH | `/:workspaceId/members/:targetUserId/remove-user` | Admin-only: remove an active member (owner exempt, last-admin protected) |
| PATCH | `/:workspaceId/members/:targetUserId/update-user` | Admin-only: change a member's role |
| GET | `/:workspaceId` | Fetch a workspace's public details (private workspaces are hidden from non-members) |
| PATCH | `/:workspaceId` | Admin-only: update name/description/category (mode is immutable after creation) |
| DELETE | `/:workspaceId` | Owner-only: soft-delete a workspace (cascades to memberships + tasks) |

### Tasks — `/api/workspace/:workspaceId/tasks` (auth + active membership required)

| Method | Path | Description |
|---|---|---|
| GET | `/trash` | List soft-deleted tasks in the workspace |
| POST | `/` | Create a task (`title`, `description`, `dueDate`, `priority`, `assignedTo`) |
| GET | `/` | List tasks, with optional `search` (title/description) and `status`/`priority` filters |
| POST | `/:taskId/assign` | Reassign a task to another active member (blocked on cancelled/completed tasks) |
| PATCH | `/:taskId/status` | Update status — allowed transitions differ for the assignee vs. a manager (admin/creator) |
| PATCH | `/:taskId/restore` | Restore a soft-deleted task (creator or admin only) |
| DELETE | `/:taskId/permanent-delete` | 🚧 Route defined, controller not yet implemented |
| POST | `/:taskId/attachments` | 🚧 Route defined, controller not yet implemented |
| DELETE | `/:taskId/attachments/:attachmentId` | 🚧 Route defined, controller not yet implemented |
| GET | `/:taskId/activity-logs` | 🚧 Route defined, controller not yet implemented |
| GET | `/:taskId` | Fetch a single task |
| PATCH | `/:taskId` | Update title/description/assignee/priority (creator or admin only) |
| DELETE | `/:taskId` | Soft-delete a task (creator or admin only) |

### Comments — `/api/workspace/:workspaceId/tasks/:taskId/comments` (auth + active membership required)

| Method | Path | Description |
|---|---|---|
| POST | `/` | Create a top-level comment, or a reply (requires both `parentId` and `repliedUserId`) |
| GET | `/` | List all comments for the task, oldest first, with deleted comments sanitized |
| PATCH | `/:commentId` | Author-only: edit comment content |
| DELETE | `/:commentId` | Author or admin: soft-delete a comment |

### Misc

| Method | Path | Description |
|---|---|---|
| GET | `/api/test/protected` | Sample route for verifying `authMiddleWare` behavior |

### Response envelope
Successful responses follow a consistent shape:
```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {
    "payload": { "...": "..." },
    "meta": { "timestamp": "2026-08-08T00:00:00.000Z" }
  }
}
```
Errors are shaped by the shared `errorMessage` helper and the central error middleware, which also maps Prisma error codes to friendlier responses (`P2025` → 404 "Record not found", `P2002` → 400 "Record already exists").

---

## Security Design

- **Helmet** applied on both the main and maintenance apps for baseline HTTP security headers.
- **CORS** locked to an explicit, comma-separated allow-list (`CLIENT_URL`), with credentials enabled and `Authorization` exposed for the frontend to read.
- **Password hashing** via bcrypt with a configurable cost factor (`SALT_ROUND`, default 12).
- **JWT strategy**: short-lived (15 min) access tokens carried in the `Authorization` header, longer-lived (3 day) refresh tokens in an `httpOnly` + `secure` + `sameSite=none` cookie scoped to `/api/auth` only — access tokens never touch cookies, refresh tokens never touch `localStorage`.
- **Multi-layered rate limiting**, each with its own Redis key prefix so limiters don't collide:
  - **Global**: 210 requests / 30 min (`express-rate-limit`) + progressive slow-down after 200 requests (`express-slow-down`), applied to the whole app.
  - **Login / Register**: three concurrent limiters per route — by IP, by hashed user identity (SHA-256 of email/username, so raw credentials never land in Redis keys), and a combined IP+identity limiter with a tighter ceiling (10 / 30 min) — plus a slow-down after 20 attempts.
- **Input validation & sanitization** on every write endpoint via `express-validator` (`trim()`, `escape()`, `isUUID()`, `isISO8601()`, allow-listed enums for role/status/priority/mode/category), with a shared "first error wins" result handler.
- **Authorization is enforced at the service layer**, not just route middleware — every mutating service call re-checks workspace existence, active membership, and role before touching data, using the shared `workspacePermission.js` helpers.
- **Soft-delete everywhere** for Users, Workspaces, Tasks, and Comments — nothing is hard-deleted by default, preserving an audit trail and enabling recovery windows.
- **Concurrency-safe membership guardrails**: leave/remove operations run inside a Prisma transaction that re-counts active admins before allowing the last one to leave, preventing a workspace from ending up admin-less under concurrent requests.
- **Body size limit** (`10kb`) on JSON/urlencoded parsing to reduce payload-based abuse.
- **Structured logging** via Winston (file + console) instead of ad hoc `console.log` for operational events (though some debug `console.log`/`console.error` calls remain in service code — see [Known Limitations](#known-limitations--roadmap)).
- **`MAINTENANCE_MODE` kill switch**: flipping one env var swaps the entire Express app for a locked-down 503-only app, useful for emergency lockdown during incident response or deploys.

---

## Frontend Design System

- **"Ocean Depths" theme**: a teal/slate palette defined entirely as CSS custom properties in `tokens.css`, toggled via `[data-theme="light"|"dark"]` on `<html>`. Includes semantic tokens (success/warning/error with bg+border variants), a 5-color presence palette (deterministically hashed per user ID for avatar coloring), and dedicated skeleton-loading gradient tokens.
- **Theme persistence**: `zustand` theme store resolves `system` preference via `matchMedia`, persists the user's explicit choice to `localStorage`, and applies a brief CSS transition class when switching.
- **Component library** (`src/components/ui/`): button, card, dialog (+ `ConfirmDialog` helper), dropdown-menu, input, label, select, separator, skeleton, tabs, textarea, toast, avatar, badge — each paired with a CSS Module. Built from scratch (no Radix/shadcn runtime dependency), keeping the bundle lean.
- **Routing & code-splitting**: every page is `React.lazy`-loaded and wrapped in `Suspense` with a shared `PageSkeleton` fallback; route transitions are animated with `framer-motion`'s `AnimatePresence`.
- **Auth-aware routing**: `AuthGate` redirects unauthenticated users to `/login`; `GuestGate` redirects authenticated users away from landing/login/register; both defer rendering during the initial silent-refresh check via a `SplashScreen`.
- **Data layer**: all server state goes through TanStack Query hooks (`use-workspaces`, `use-tasks`, `use-comments`, `use-members`) that wrap a shared `apiGet/apiPost/apiPatch/apiDelete` helper, auto-unwrap the backend's `data.payload` envelope, and surface errors via a global toast system (`use-toast`).

---

## Project Structure

```
Collaborative-Saas-Web-application-main/
├── README.md
├── .gitignore
│
├── backend/
│   ├── server.js                       # entrypoint: boots main or maintenance app
│   ├── prisma.config.ts                # Prisma CLI config (schema/migrations paths)
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma               # data model (see Data Model)
│   │   └── migrations/
│   │       ├── migration_lock.toml
│   │       └── 20260720133854_init/migration.sql
│   └── src/
│       ├── boot/
│       │   ├── loadApplication.js      # MAINTENANCE_MODE switch
│       │   ├── mainApp.js              # real Express app (helmet/cors/routes)
│       │   └── maintenanceApp.js       # 503-only fallback app
│       ├── config/
│       │   └── prisma.js               # PrismaClient via pg adapter/pool
│       ├── jobs/
│       │   └── dbCleanup.js            # 🚧 scaffold, not implemented
│       ├── middleware/
│       │   ├── apperror.js             # AppError class (statusCode + isOperational)
│       │   ├── auth.middleware.js      # JWT verification, populates req.user
│       │   ├── error.middleware.js     # centralized error handler + Prisma code mapping
│       │   ├── read.json.js            # loads workspace category taxonomy
│       │   ├── workspacePermission.js  # shared authorization helpers (taskRules, etc.)
│       │   └── ratelimit/
│       │       ├── globalLimiter.js
│       │       ├── loginLimiter.js
│       │       ├── registerLimiter.js
│       │       └── forgotPasswdLimiter.js  # 🚧 not implemented
│       ├── modules/
│       │   ├── auth/          (controller, routes, service, validator)
│       │   ├── workspace/     (controller, routes, service, validator)
│       │   ├── task/          (controller, routes, service, validator)
│       │   ├── comments/      (controller, route, service, validator)
│       │   └── settings/      # 🚧 empty scaffold — controller/routes/service/validator
│       ├── routes/
│       │   ├── test.route.js           # sample protected route
│       │   ├── route.register.js       # ⚠️ legacy/unused scratch file, not mounted
│       │   └── quick.update.db.js      # ⚠️ dev-only one-off script, not mounted
│       ├── resources/
│       │   └── categories.json         # workspace category taxonomy
│       └── utils/
│           ├── hash.js                 # bcrypt + SHA-256 identity hashing
│           ├── helper.message.js       # standard error JSON shape
│           ├── redis-client.js         # Redis connection w/ reconnect strategy
│           ├── redisStore.js           # rate-limit-redis store factory
│           └── logger/customLogger.js  # Winston logger (file + console)
│
└── client_side/
    ├── index.html
    ├── vite.config.js                  # dev proxy: /api → VITE_API_URL
    ├── package.json
    ├── README.md
    └── src/
        ├── main.jsx / App.jsx          # router, query client, auth bootstrapping
        ├── index.css / tokens.css      # global styles + design tokens
        ├── components/
        │   ├── animated-page.jsx
        │   ├── comment-section.jsx     # threaded comment UI
        │   ├── create-workspace-modal.jsx
        │   ├── error-boundary.jsx
        │   ├── slideshow-background.jsx
        │   ├── theme-toggle.jsx
        │   ├── layout/                 # app-layout.jsx, navbar.jsx (+ CSS module)
        │   └── ui/                     # button, card, dialog, dropdown, input, select,
        │                               # tabs, toast, avatar, badge, label, separator,
        │                               # skeleton, textarea (each + .module.css)
        ├── hooks/
        │   ├── use-workspaces.js
        │   ├── use-tasks.js
        │   ├── use-comments.js
        │   ├── use-members.js
        │   └── use-toast.js
        ├── lib/
        │   ├── api.js                  # axios instance + refresh interceptor
        │   ├── constants.js            # categories/statuses/priorities/roles
        │   └── utils.js                # cn, timeAgo, countdown, getInitials, etc.
        ├── stores/
        │   ├── auth-store.js           # zustand: user, accessToken, isAuthenticated
        │   └── theme-store.js          # zustand: light/dark/system theme
        └── pages/
            ├── landing.jsx / login.jsx / register.jsx
            ├── dashboard.jsx / discover.jsx
            ├── workspace-detail.jsx / task-detail.jsx
            ├── trash.jsx / profile.jsx
            ├── maintenance.jsx / not-found.jsx
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A running PostgreSQL instance
- A running Redis instance

### 1. Clone & install

```bash
git clone <repository-url>
cd Collaborative-Saas-Web-application-main
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` (see [Environment Variables](#environment-variables) for the full list):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/itgel_db
REDIS_URL=redis://localhost:6379
JWT_ACCESS_SECRET_KEY=your_access_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
CLIENT_URL=http://localhost:5173
PORT=8080
HOST=0.0.0.0
SALT_ROUND=12
MAINTENANCE_MODE=false
```

Generate the Prisma client, run migrations, and start the server:

```bash
npx prisma generate
npx prisma migrate deploy   # or `migrate dev` in local development
npm run dev                 # nodemon, auto-restart
# or
npm start                   # plain node
```

The API listens on `http://localhost:8080` by default.

### 3. Frontend setup

In a separate terminal:

```bash
cd client_side
npm install
```

Create a `.env` file in `client_side/`:

```env
VITE_API_URL=http://localhost:8080
VITE_MAINTENANCE_MODE=false
```

```bash
npm run dev
```

The Vite dev server runs at `http://localhost:5173` and proxies `/api/*` requests to `VITE_API_URL`.

### 4. Production build

```bash
cd client_side
npm run build
```

`mainApp.js` serves the built frontend (`client_side/dist`) as static files and falls back to `index.html` for any non-API route, so a single backend process can serve the whole application in production.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string used by the Prisma `pg` adapter |
| `REDIS_URL` | ✅ | Redis connection string for rate-limit stores |
| `JWT_ACCESS_SECRET_KEY` | ✅ | Signing secret for short-lived access tokens |
| `JWT_REFRESH_SECRET_KEY` | ✅ | Signing secret for refresh tokens |
| `CLIENT_URL` | ✅ | Comma-separated list of allowed CORS origins |
| `PORT` | – | API port (default `8080`) |
| `HOST` | – | Bind address (default `0.0.0.0`) |
| `SALT_ROUND` | – | bcrypt cost factor (default `12`) |
| `REDIS_RETRIES` | – | Max Redis reconnect attempts before giving up (default `5`) |
| `MAINTENANCE_MODE` | – | `"true"` swaps in the 503-only maintenance app |

### Frontend (`client_side/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Base URL of the backend API (used at build/dev time) |
| `VITE_MAINTENANCE_MODE` | – | `"true"` forces the frontend into its own maintenance screen |

> No `.env.example` files are currently committed in either package — copy the tables above into `.env` files to get started.

---

## Available Scripts

### Backend (`backend/package.json`)
| Script | Command | Purpose |
|---|---|---|
| `npm start` | `node server.js` | Run the production server |
| `npm run dev` | `nodemon server.js` | Run with auto-restart on file changes |
| `npm run build` | `prisma generate` | Regenerate the Prisma client |
| `npm test` | — | Not configured (`exit 1` placeholder) |

### Frontend (`client_side/package.json`)
| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `vite --host` | Start the dev server (LAN-accessible) |
| `npm run build` | `vite build` | Production build to `dist/` |
| `npm run preview` | `vite preview` | Preview the production build locally |
| `npm run lint` | `eslint .` | Lint the frontend source |

---

## Known Limitations & Roadmap

This section is included deliberately, based on a full read-through of the codebase, so the project's real state is documented rather than glossed over:

- **Settings module is an empty scaffold.** `backend/src/modules/settings/*.js` exist but contain no code and are not mounted in `mainApp.js`.
- **Task attachments and activity logs are stubbed.** The routes exist (`POST/DELETE .../attachments`, `GET .../activity-logs`) and are wired into `task.routes.js`, but their controllers and service functions are empty function bodies — calling them will not error, but they do nothing.
- **`deleteTaskPermanently`** has a route and a partially-written service function, but the controller body is empty, so the endpoint is effectively a no-op; the service function also references an `id_workspaceId` compound key that isn't defined as a `@@unique` in the current schema.
- **Forgot-password flow is not implemented** — `forgotPasswdLimiter.js` contains only a comment marking it as "under development," and there is no corresponding route, controller, or service.
- **`rejectUser` (workspace service) has a latent bug**: it calls `prisma.membership.delete()` with both a non-unique `where` clause and a `data` payload — `delete()` doesn't accept a `data` argument and its `where` needs the compound `userId_workspaceId` unique key (as used correctly elsewhere in the same file), so this operation will throw at runtime rather than reject the membership as intended.
- **Two dead/legacy files remain in `backend/src/routes/`**: `route.register.js` (an early, unmounted duplicate of the register endpoint with a missing `.js` import extension) and `quick.update.db.js` (a one-off manual data-fix script that executes a Prisma query at import time). Neither is referenced by `route.register.js`'s consumers or mounted in the app; both are safe to delete before shipping.
- **No automated tests.** `npm test` is an unconfigured placeholder in both packages.
- **No CI/CD or containerization** currently checked into the repo (no `Dockerfile`, `docker-compose.yml`, or `.github/workflows`).
- **Some debug `console.log`/`console.error` calls remain** in service code (e.g. `workspace.service.js`, `task.service.js`) alongside the structured Winston logger — worth consolidating before production hardening.
- **Root and client `README.md` files predate the current implementation** (the root README still describes SQLite and an "empty" frontend); this document supersedes them.

### Suggested next steps
1. Implement or remove the settings module and the attachment/activity-log endpoints.
2. Fix the `rejectUser` Prisma call and add the missing `@@unique` for permanent task deletion, or rewrite that query.
3. Delete the two dead files under `backend/src/routes/`.
4. Add integration tests around the auth flow, membership guardrails (last-admin protection), and task status transition rules — these are the highest-risk, most logic-dense areas of the codebase.
5. Add a `Dockerfile`/`docker-compose.yml` for Postgres + Redis + API to simplify local onboarding, and a minimal CI workflow (lint + build) on push.
6. Commit `.env.example` files for both packages.

---

## Codebase Stats

| Package | Files | Lines of code (approx.) |
|---|---|---|
| Backend (`backend/src` + `server.js`) | 43 JS files | ~3,820 |
| Frontend (`client_side/src`) | 45 JS/JSX files (+ 17 CSS Modules) | ~4,135 |

---

## License

MIT — as declared in `backend/package.json`. Author: **ITGEL** (Infinite Technology Global Enterprise Limited).
