# jux-api

REST API for **Jux**, a shared YouTube jukebox: users create rooms and listen to music together.

**Stack:** NestJS 12 · TypeScript (ESM) · TypeORM · PostgreSQL · JWT · Swagger (OpenAPI) · Vitest · pnpm · Docker/Podman Compose

## Getting started

```bash
cp .env.example .env                   # then fill in .env (JWT_SECRET is required)
pnpm install
docker compose up -d                   # Postgres
docker compose --profile tools up -d   # Postgres + pgAdmin (http://localhost:8083)
pnpm run start:dev                     # API: http://localhost:<PORT>/api/v1, Swagger UI: http://localhost:<PORT>/docs
```

With Podman, use `podman-compose` with the same arguments.

Swagger UI is on only when `NODE_ENV=development`; `SWAGGER_ENABLED=true|false` overrides that.

## API

All routes are under `/api/v1`.

### Auth (`/auth`)

| Method | Route            | Description                                       |
| ------ | ---------------- | ------------------------------------------------- |
| POST   | `/auth/register` | create a user (name, email, password)             |
| POST   | `/auth/login`    | log in by name or email + password                |
| GET    | `/auth/refresh`  | issue a new access token using the refresh cookie |
| GET    | `/auth/logout`   | revoke the refresh token and clear the cookie     |

Login, register and refresh return `{ accessToken }` and set the refresh token in an `httpOnly` cookie (`refreshToken`, 7 days). Access token lifetime is set by `JWT_EXPIRATION_TIME`.

### Rooms (`/room`)

| Method | Route                   | Description                                      |
| ------ | ----------------------- | ------------------------------------------------ |
| GET    | `/room`                 | list rooms: pagination, sorting, search, filters |
| GET    | `/room/:id`             | one room                                         |
| POST   | `/room/:userId`         | create a room owned by the user                  |
| PATCH  | `/room/:userId/:roomId` | update the user's room                           |
| DELETE | `/room/:userId/:roomId` | delete the user's room                           |

A room has a name and access type (`public` / `private`). List responses have the shape `{ meta, items }`.

## Project structure

```
src/
├── main.ts           # bootstrap
├── app/              # root AppModule + app.setup.ts (prefix, CORS, ValidationPipe; shared with e2e)
├── common/           # shared constants, DTOs, decorators, validators, helpers
├── database/         # TypeORM connection
├── jwt/              # JWT module config
├── entities/         # User, UserCredentials, Room
└── modules/
    ├── room/         # rooms CRUD
    └── user/auth/    # registration, login, refresh tokens
test/                 # e2e tests
```

## Scripts

| Command                | Description              |
| ---------------------- | ------------------------ |
| `pnpm run start:dev`   | dev server with watch    |
| `pnpm run start:debug` | dev server with debugger |
| `pnpm run build`       | compile to `dist/`       |
| `pnpm run start:prod`  | run the compiled build   |
| `pnpm run lint`        | ESLint                   |
| `pnpm run format`      | Prettier + ESLint --fix  |
| `pnpm run test`        | unit tests (Vitest)      |
| `pnpm run test:e2e`    | e2e tests                |
| `pnpm run test:cov`    | coverage                 |

## Environment variables

See `.env.example` for the full list with defaults.

| Variable               | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `PORT`                 | HTTP port                                        |
| `CORS_ORIGIN`          | allowed origins, comma-separated                 |
| `NODE_ENV`             | `development` enables Swagger                    |
| `SWAGGER_ENABLED`      | `true`/`false`, overrides the `NODE_ENV` default |
| `POSTGRES_*`           | DB connection (also used by Docker Compose)      |
| `JWT_SECRET`           | access token signing secret                      |
| `JWT_EXPIRATION_TIME`  | access token lifetime with a unit: `15m`, `1h`   |
| `COMPOSE_PROJECT_NAME` | prefix for containers, volumes and network       |
| `PGADMIN_*`            | pgAdmin port and login (`--profile tools`)       |
