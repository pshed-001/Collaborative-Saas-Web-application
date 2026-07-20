# ITGEL Client (Frontend)

React 19 + Vite frontend for the ITGEL collaborative workspace platform.

## Getting Started

### Prerequisites

- Node.js 18+
- The ITGEL backend must be running on port 8080 (or a port of your choice)

### Backend `.env` requirement

For the frontend to communicate with the backend, add the following line to your **backend** `.env`:

```
CLIENT_URL=http://localhost:5173
```

If you run the backend on a different port or need multiple allowed origins, use comma separation:

```
CLIENT_URL=http://localhost:5173,http://localhost:3000
```

**Note:** The frontend expects the backend to be running at `http://localhost:8080`. If your backend uses a different port, update the proxy settings in `vite.config.js`.

### Install and run

```bash
npm install
npm run dev
```

This starts the Vite dev server at `http://localhost:5173`. API requests to `/auth/*` and `/workspace/*` are automatically proxied to the backend.

### Build for production

```bash
npm run build
npm run preview
```

## Architecture

- **React 19 + Vite** for build tooling
- **CSS Modules + CSS custom properties** for styling (Ocean Depths theme)
- **React Router v7** for routing
- **TanStack Query v5** for server state management
- **Zustand** for client state (auth, theme)
- **React Hook Form + Zod** for form validation
- **Axios** for HTTP with token refresh interceptor
- **Framer Motion** for page/component transitions

## Theme

The app uses a deep teal-to-slate-blue color scheme called "Ocean Depths." All colors are defined as CSS custom properties in `src/tokens.css`, toggled via the `data-theme` attribute on the `<html>` element. Light/dark/system theme modes are supported and persisted to localStorage.

## Hooks

- `use-workspaces` — workspaces, join, leave, create, delete, recover
- `use-members` — list, approve, reject, remove, role update
- `use-tasks` — list, create, reassign

All hooks integrate directly with TanStack Query for caching and invalidation.
