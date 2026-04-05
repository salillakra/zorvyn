# Screening Assignment API

Backend API for a role-based finance/audit workflow built with NestJS, Prisma, PostgreSQL, and Better Auth.

## What this project includes

- Authentication with Better Auth (email/password + bearer token plugin)
- Role-based authorization (viewer, analyst, admin)
- Transactions module with filtering, soft-delete, and restore
- Dashboard module with aggregate and recent-data endpoints
- Read-only categories endpoint
- OpenAPI/Swagger documentation at /api

## Tech stack

- Runtime: Node.js, NestJS
- Package manager: pnpm
- ORM: Prisma 7 + @prisma/adapter-pg
- Database: PostgreSQL
- Auth: better-auth + @thallesp/nestjs-better-auth
- Validation: class-validator
- API docs: @nestjs/swagger

## Setup process

### 1. Install dependencies

```bash
pnpm install
```

### 2. Create environment variables

Create a local .env file with at least:

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="replace-with-a-long-random-secret"

# Optional pool tuning
PRISMA_POOL_MAX=3
PRISMA_POOL_CONNECTION_TIMEOUT_MS=60000
PRISMA_POOL_IDLE_TIMEOUT_MS=30000
```

### 3. Generate Prisma client

```bash
pnpm prisma generate --config prisma.config.ts
```

### 4. Sync database schema

This project currently uses Prisma db push for local development setup:

```bash
pnpm prisma db push --config prisma.config.ts
```

### 5. Start the application

```bash
pnpm run start:dev
```

Server defaults to port 3000 unless PORT is set.

## API documentation

- Swagger UI: http://localhost:3000/api
- OpenAPI JSON is available from the same Swagger setup in Nest.

Swagger includes:

- Route tags by module
- Request body schemas
- Query and path parameter docs
- Bearer auth configuration for protected endpoints

## Authentication and authorization model

- Public routes (no token required):
  - POST /auth/register
  - POST /auth/login
- All other routes require a valid token.
- Role guard checks user role from database before route execution.

## Route map (20 routes across 5 modules)

### Auth (3)

- POST /auth/register
- POST /auth/login
- POST /auth/logout

### Users (5)

- GET /users/me
- GET /users
- GET /users/:id
- PUT /users/:id
- DELETE /users/:id

### Transactions (7)

- GET /transactions
- GET /transactions/deleted
- GET /transactions/:id
- POST /transactions
- PUT /transactions/:id
- DELETE /transactions/:id
- PATCH /transactions/:id/restore

### Dashboard (4)

- GET /dashboard/summary
- GET /dashboard/trends
- GET /dashboard/categories
- GET /dashboard/recent

### Categories (1)

- GET /categories

## Important routing notes

- /users/me is declared before /users/:id to avoid dynamic route shadowing.
- /transactions/deleted is declared before /transactions/:id for the same reason.

## Assumptions made

- Categories are treated as read-only for this assignment.
- Category creation/updates are expected to be handled outside API scope (for example via DB initialization scripts or admin SQL).
- Soft-delete is preferred for transactions (is_deleted flag) instead of hard deletion.
- Role IDs are stable string identifiers (viewer, analyst, admin).



## Useful scripts

```bash
pnpm run start:dev
pnpm run build
pnpm run test
pnpm run test:e2e
pnpm run lint
```
