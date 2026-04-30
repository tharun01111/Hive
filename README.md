# Hive

Hive is a full-stack collaborative workspace application for managing workspaces, projects, Kanban boards, members, realtime chat, activity, and notifications.

## Stack

- Client: React 19, Vite, JavaScript, React Router, Zustand, Axios, Socket.IO client, Tailwind CSS.
- Server: Express, Prisma, PostgreSQL, JWT auth, refresh-token cookies, Socket.IO, Redis Socket.IO adapter.
- Infrastructure: Docker Compose, Postgres, Redis, nginx.

## Project Structure

```text
client/   React frontend
server/   Express API, Prisma schema, Socket.IO handlers
nginx/    reverse proxy config for local Docker setup
```

## Request Flow

```text
React UI -> Axios API client -> Express route -> middleware -> controller -> service -> Prisma/PostgreSQL
```

## Realtime Flow

```text
React Socket.IO client -> Socket.IO server -> membership check -> service/database update -> project/workspace/user room emit
```

Redis is currently used for Socket.IO scaling through the Redis adapter. It is not used as a durable job queue yet.

## Local Development

Start the full local stack:

```bash
docker compose up --build
```

The app is designed to run through nginx at:

```text
http://localhost
```

Useful service defaults in Docker Compose:

- Client dev server: `client`
- Server API: `server:3000`
- Postgres: `postgres:5432`
- Redis: `redis:6379`

## Environment Variables

Server:

```text
NODE_ENV=development
PORT=3000
RUNNING_IN_DOCKER=true
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
CLIENT_URL=http://localhost
```

Client:

```text
VITE_API_URL=http://localhost/api
VITE_SOCKET_URL=http://localhost
```

Use real secrets in production. Do not reuse development secrets for deployed environments.

## Database

Prisma schema lives at:

```text
server/prisma/schema.prisma
```

Migrations live at:

```text
server/prisma/migrations/
```

Migrations should be committed. They are part of the production database history.

Production startup currently runs Prisma migrations before starting the server through the server `npm start` script.

## Security Rules

Hive uses authentication plus resource-level authorization.

- Workspace routes require workspace membership or admin role.
- Project routes require project membership or admin role.
- Kanban card and column services verify the target record belongs to the authorized project.
- Message deletion verifies the message belongs to the current project and was created by the current user.
- Socket.IO room joins verify project/workspace membership before joining rooms.
- Socket.IO write events verify project membership before mutating or emitting project data.

## Validation

Routes use Zod schemas through `server/middleware/validate.js`.

Validation covers:

- Request bodies
- Route params
- Query params
- UUID route IDs
- Role enums
- Pagination limits
- Kanban reorder payloads

## Rate Limiting

Auth routes use rate limiting to reduce brute-force pressure on login, register, and refresh endpoints.

## Deployment Notes

The production client nginx config is in:

```text
client/nginx.conf
```

The root Docker nginx config is in:

```text
nginx/nginx.conf
```

Both are configured to proxy:

- `/api/` to the backend server
- `/socket.io/` to the backend Socket.IO server

## Current Gaps

Important next production-readiness work:

- Add automated tests for auth, authorization, Kanban ownership, and socket authorization.
- Add structured logging.
- Add Prometheus metrics or another observability layer.
- Add TanStack Query for server state on the frontend.
- Add a background worker only when notification/activity/email jobs need durable retries.
- Add CI checks for lint, Prisma validation, tests, and builds.
