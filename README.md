# Collaborative SaaS Web Application

A team workspace and project management platform. Users can create workspaces, manage memberships, assign tasks, and collaborate across teams.

# Projetc Status
Backend API in active development (MVP stage). Core authentication (JWT access/refresh with rotation) and workspace role management (Member/Admin/Owner) are implemented and functional. Task management module, frontend, CORS configuration, and rate limiting are under development — see Known Issues below for full details.
---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 5 |
| Database | SQLite (via Prisma) |
| Auth | JWT (access + refresh tokens) |
| Password | bcrypt |
| Validation | express-validator |
| Frontend | React 19 + Vite |

---

## Project Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       │   ├── auth/
│       │   ├── workspace/
│       │   ├── membership/       # in progress
│       │   └── task/             # in progress
│       ├── routes/
│       └── utils/
└── client_side/                  # React frontend (in progress)
```

---

## Database Schema

**User** — stores credentials and profile info  
**Workspace** — team spaces with PUBLIC or PRIVATE visibility  
**Membership** — links users to workspaces with roles (ADMIN, MEMBER) and statuses (ACTIVE, PENDING, REJECTED, REMOVED, LEFT)  
**Task** — created within a workspace, can be assigned and completed by members  

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:

```env
JWT_ACCESS_SECRET_KEY=your_access_secret
JWT_REFRESH_SECRET_KEY=your_refresh_secret
```

Run migrations and start:

```bash
npx prisma migrate dev
npm start
```

### Frontend Setup

```bash
cd client_side
npm install
npm run dev
```

### Frontend Current State
```Frontend state
Currently empty 
Building backend first
```


## API Reference

### Auth — `/auth`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive tokens |
| POST | `/auth/refresh` | Rotate access token using refresh token |
| POST | `/auth/logout` | Clear session |

### Workspaces — `/workspace`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/workspace` | ✅ | Create a workspace |
| GET | `/workspace` | ✅ | Get all public workspaces |
| GET | `/workspace/me` | ✅ | Get workspaces you belong to |
| GET | `/workspace/:id` | ✅ | Get workspace content |
| POST | `/workspace/:id/join` | ✅ | Request to join |
| GET | `/workspace/:id/members` | ✅ | List members |
| PATCH | `/workspace/:id/members/:userId/approve` | ✅ Admin | Approve join request |
| PATCH | `/workspace/:id/members/:userId/reject` | ✅ Admin | Reject join request |
| PATCH | `/workspace/:id/members/:userId/remove` | ✅ Admin | Remove a member |
| PATCH | `/workspace/:id/update` | ✅ Admin | Update workspace details |
| DELETE | `/workspace/:id/delete` | ✅ Owner | Soft delete (moves to trash) |
| PATCH | `/workspace/:id/recover` | ✅ Owner | Recover from trash (within 30 days) |
| PATCH | `/workspace/:id/leave` | ✅ | Leave a workspace |

### Auth Flow

1. `POST /auth/login` returns an access token in the `Authorization` header and a refresh token as an `httpOnly` cookie
2. Include `Authorization: Bearer <accessToken>` on protected requests
3. When the access token expires, call `POST /auth/refresh` — both tokens are rotated

---

## Roles & Permissions

| Action | Member | Admin | Owner |
|---|---|---|---|
| View workspace | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ✅ |
| Approve/reject members | ❌ | ✅ | ✅ |
| Remove members | ❌ | ✅ | ✅ |
| Update workspace | ❌ | ✅ | ✅ |
| Delete workspace | ❌ | ❌ | ✅ |
| Recover workspace | ❌ | ❌ | ✅ |

---

## Known Issues

- `task` and `membership` modules are not yet implemented
- No CORS configuration — frontend requests will be blocked until added
- No rate limiting on auth endpoints
- Frontend is not yet built

---

## Roadmap

- [ ] Implement task module (create, assign, complete)
- [ ] Implement membership module
- [ ] Add CORS middleware
- [ ] Add rate limiting on auth routes
- [ ] Build React frontend
- [ ] Add pagination to workspace list endpoints
- [ ] Write tests

---

## License

ISC
