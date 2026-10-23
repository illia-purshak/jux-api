# template-api

Starter template for REST APIs.

**Stack:** NestJS 12 · TypeScript (ESM) · Swagger (OpenAPI) · TypeORM · PostgreSQL · class-validator · Vitest · ESLint (+ Stylistic) · Prettier · pnpm · Docker/Podman Compose

## Getting started from this template

Follow these steps once, right after cloning.

### 1. Clone without the template history

```bash
git clone <template-repo-url> my-api
cd my-api
rm -rf .git && git init
```

(Or use **Use this template** on GitHub.)

### 2. Rename the project

- `package.json`: set `name`, `description` and `author`.
- `.env.example`: set `COMPOSE_PROJECT_NAME` and `POSTGRES_DATABASE` to your project name.
- `src/common/constants/app.constants.ts`: change `API_PREFIX` if `api/v1` doesn't fit.
- This README: replace this section with a description of your project.

### 3. Environment

```bash
cp .env.example .env
```

Fill in `.env`. It is git-ignored; `.env.example` is the committed list of all variables, so keep it in sync whenever you add a new one.

`.env` is loaded by `ConfigModule` (in `AppModule`) on startup; variables exported in the shell take precedence.

### 4. Install and start the database

```bash
pnpm install
docker compose up -d                   # Postgres
docker compose --profile tools up -d   # Postgres + pgAdmin (http://localhost:8083)
```

With Podman, use `podman-compose` with the same arguments.

### 5. Connect the app to the database

This step is not done in the template, so that the template doesn't force a DB driver. `@nestjs/config` is already set up.

```bash
pnpm add pg
```

`src/app/app.module.ts`:

```ts
import { ConfigModule, ConfigService } from "@nestjs/config"; // already imported
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // already there
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: "postgres",
        host: config.getOrThrow("POSTGRES_HOST"),
        port: Number(config.getOrThrow("POSTGRES_PORT")),
        username: config.getOrThrow("POSTGRES_USER"),
        password: config.getOrThrow("POSTGRES_PASSWORD"),
        database: config.getOrThrow("POSTGRES_DATABASE"),
        autoLoadEntities: true,
        synchronize: false, // use migrations; `true` only for quick local prototyping
      }),
    }),
    // feature modules
  ],
  // ...
})
export class AppModule {}
```

> **TypeORM 1.x:** `undefined`/`null` values in `where` throw by default (`invalidWhereValuesBehavior`). Add optional filters to `where` only when they are set, as `ExampleService.findAll` does.

### 6. Create your first module

Use the `example` module as the reference:

1. Copy `src/modules/example` to `src/modules/<name>` and `src/entities/example.entity.ts` to `src/entities/<name>.entity.ts`.
2. Rename `Example`/`example` to your name in all of them, including the route in `@Controller('...')` and the table in `@Entity('...')`.
3. Add the module to `imports` in `AppModule`.
4. Delete the `example` module and entity when you no longer need them as a reference.

### 7. Check that everything works

```bash
pnpm run start:dev   # API: http://localhost:<PORT>/api/v1, Swagger UI: http://localhost:<PORT>/docs
pnpm run lint
pnpm run test
```

## Project structure

```
src/
├── main.ts                 # bootstrap: loads .env, applies app.setup, mounts Swagger, starts the server
├── app/                    # root AppModule + app.setup.ts (prefix, CORS, ValidationPipe, serializer; shared with e2e)
├── common/                 # shared code, not tied to any module
│   ├── constants/          # app-wide constants (see the header comment in app.constants.ts)
│   ├── decorators/         # reusable Nest/Swagger decorators (e.g. ApiPaginatedResponse)
│   ├── dto/                # reusable DTOs: list query params, paginated response
│   ├── validators/         # custom class-validator decorators (IsOptionalNonNullable, IsAfterOrEqual)
│   └── utils/              # small pure helpers (range filter, LIKE escaping)
│       └── transformers/   # class-transformer helpers for DTOs, grouped by result type
├── entities/               # TypeORM entities, one per file: <name>.entity.ts
└── modules/
    └── example/            # reference feature module (controller → service → repository)
        ├── dto/
        ├── example.controller.ts
        ├── example.module.ts
        └── example.service.ts
test/                       # e2e tests
```

Each template file starts with a comment describing what belongs in its folder.

## Conventions

- **Controller:** HTTP only (routes, params, status codes); no business logic.
- **Service:** business logic and DB access.
- **DTO:** every body and query is described by a DTO with class-validator decorators. The global `ValidationPipe` rejects unknown fields (`forbidNonWhitelisted`) and converts types (`transform`).
- **Imports:** the project is ESM, so imports need the `.js` extension (`'./example.service.js'`). Use aliases for anything outside the current folder (see below), relative `./` imports inside it.
- **Secrets:** environment variables only, never constants.

## Path aliases

Defined in `tsconfig.json` (`paths`):

| Alias          | Path                     |
| -------------- | ------------------------ |
| `@app/*`       | `src/app/*`              |
| `@common/*`    | `src/common/*`           |
| `@constants/*` | `src/common/constants/*` |
| `@dto/*`       | `src/common/dto/*`       |
| `@utils/*`     | `src/common/utils/*`     |
| `@entities/*`  | `src/entities/*`         |
| `@modules/*`   | `src/modules/*`          |

```ts
import { ExampleEntity } from "@entities/example.entity.js"; // file: keep `.js`
import { ToStringArray } from "@utils/transformers"; // folder with index.ts: no extension
```

- `nest build` / `nest start` rewrite aliases into relative paths in `dist/`; Vitest resolves them via `resolve.tsconfigPaths`. Running compiled code any other way (e.g. `tsc` + `node`) won't resolve them.
- Each alias also falls back to `<folder>/index.ts`, so barrel folders can be imported without `/index.js`.
- Editor shows `Cannot find module '@...'` after `paths` changed? Run **TypeScript: Restart TS Server** (VS Code keeps the old config until the server restarts).
- To add an alias, add both entries (`./src/x/*` and `./src/x/*/index.ts`) to `paths`.

## Code style

- **Formatting of TS/JS** is done by **ESLint Stylistic** (`@stylistic` in `eslint.config.mjs`): 2 spaces, semicolons, trailing commas, spacing, brace style. **Quotes are never changed**: single and double are both fine. Style issues are warnings and are autofixed on save or by `pnpm run format`.
- **Prettier** formats only JSON/Markdown/YAML (TS/JS are listed in `.prettierignore`), because Prettier has no option to leave quotes alone.
- **ESLint code rules:** `typescript-eslint` recommended type-checked rules.
  - **Warnings:** `any` and unsafe `any` usage, `unknown` in unions/template strings, unused imports/variables (prefix with `_` to mark them as intentionally unused).
  - **Errors:** floating promises (mark intentional ones with `void`).
  - **Off:** `require-await`, `no-empty-object-type`, `no-misused-promises` for void callbacks; unsafe/unbound-method rules in tests.
- **Do not** enable `@typescript-eslint/consistent-type-imports`: `import type` drops runtime metadata and breaks Nest DI and class-validator.
- **VS Code:** `.vscode/settings.json` uses ESLint as the formatter for TS/JS and Prettier for the rest; recommended extensions are in `.vscode/extensions.json`.
- **TypeScript 7 in the editor:** the workspace enables TS 7 (`js/ts.experimental.useTsgo`, extension `typescriptteam.native-preview`) regardless of user settings. Builds, tests and ESLint still use TypeScript 6 from `package.json`, because Nest CLI (Swagger plugin, alias rewriting) and typescript-eslint need the TS 6 JS API.

## Transformers

`@utils/transformers`: class-transformer decorators for DTO fields, mostly query params (they always arrive as strings).

| Decorator          | Result                 | Example                                              |
| ------------------ | ---------------------- | ---------------------------------------------------- |
| `@ToStringArray()` | `string[]`             | `?tags=a,b&tags=c` → `["a", "b", "c"]`               |
| `@ToNumberArray()` | `number[]`             | `?ids=1,2` → `[1, 2]`                                |
| `@ToBoolean()`     | `boolean`              | `?active=1` → `true`, `?active=false` → `false`      |
| `@ToMonthArray()`  | `string[]` (`YYYY-MM`) | `?months=2024-05-17` → `["2024-05"]`                 |
| `@ToJsonValue()`   | parsed JSON            | `?ids=["a","b"]` → `["a", "b"]`                      |
| `@ToEndOfDay()`    | `Date` (end of day)    | `?createdTo=2024-05-17` → `2024-05-17T23:59:59.999Z` |

Transformers only convert. A value they can't convert is passed through unchanged, so the paired validator returns a regular 400. Always pair them with validators:

```ts
@IsOptional()
@ToNumberArray()
@IsArray()
@IsInt({ each: true })
ids?: number[];
```

Every handled case is listed in the JSDoc of each decorator and covered by `transformers.spec.ts`.

## Swagger

Swagger UI is served at `/docs` and the OpenAPI JSON at `/docs-json` (outside the `api/v1` prefix). It is on only when `NODE_ENV=development` (set in `.env.example`), so a server with a missing `NODE_ENV` doesn't expose it; `SWAGGER_ENABLED=true|false` overrides that.

List endpoints document their `{ meta, items }` response with `@ApiPaginatedResponse(Model)`.

Thanks to the `@nestjs/swagger` CLI plugin in `nest-cli.json`, body DTOs are documented automatically from their TypeScript types, class-validator decorators and JSDoc comments, so `@ApiProperty` is usually not needed. Add `@ApiTags('<name>')` to each controller to group its endpoints.

The plugin works only with `nest build` / `nest start`. Dynamic DTO factories (`query.dto.ts`) use explicit `@ApiPropertyOptional`, because allowed values are only known at runtime.

## Query DTOs: `DefaultQueryParamsDto` and `ResponseBodyControlParamsDto`

`src/common/dto/query.dto.ts` builds a query DTO from an allow-list:

```ts
export class ExampleQueryDto extends DefaultQueryParamsDto({
  sortFields: ["createdAt", "name"],
  searchFields: ["name", "description"],
  defaultSortBy: "createdAt",
  include: ["author"], // optional: relations the client may request
  fields: ["id", "name"], // optional: columns the client may select
}) {
  // module-specific filters
}
```

| Param         | Example                                  | Notes                                                              |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------ |
| `page`        | `?page=2`                                | default `1`                                                        |
| `pageSize`    | `?pageSize=50`                           | default `10`, max `100`                                            |
| `sortBy`      | `?sortBy=name`                           | only values from `sortFields`                                      |
| `sortOrder`   | `?sortOrder=asc`                         | `ASC` / `DESC` (case-insensitive), default `DESC`                  |
| `search`      | `?search=abc`                            | 3–100 chars                                                        |
| `searchField` | `?searchField=name`                      | only values from `searchFields`                                    |
| `include`     | `?include=a,b` or `?include=a&include=b` | only if `include` is configured, otherwise the request is rejected |
| `fields`      | `?fields=id,name`                        | only if `fields` is configured, otherwise the request is rejected  |

`ResponseBodyControlParamsDto` contains only `include`/`fields` and is meant for single-item endpoints (`GET /:id`), where pagination/sorting/search make no sense:

```ts
export class ExampleSingleQueryDto extends ResponseBodyControlParamsDto({
  fields: ["id", "name"],
}) {}
```

`DefaultQueryParamsDto` is built from the list params plus `ResponseBodyControlParamsDto` using `IntersectionType`, so both share the same `include`/`fields` behaviour.

List responses use `ResponseListDto<T>` (`{ meta, items }`) from `src/common/dto/meta.dto.ts`. For a full example, see `ExampleService.findAll`.

## Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `pnpm run start:dev`    | dev server with watch    |
| `pnpm run start:debug`  | dev server with debugger |
| `pnpm run build`        | compile to `dist/`       |
| `pnpm run start:prod`   | run the compiled build   |
| `pnpm run lint`         | ESLint (type-aware)      |
| `pnpm run lint:fix`     | ESLint with autofix      |
| `pnpm run format:check` | formatting check (CI)    |
| `pnpm run format`       | Prettier + ESLint --fix  |
| `pnpm run test`         | unit tests (Vitest)      |
| `pnpm run test:e2e`     | e2e tests                |
| `pnpm run test:cov`     | coverage                 |

## Environment variables

| Variable               | Used by      | Description                                     |
| ---------------------- | ------------ | ----------------------------------------------- |
| `PORT`                 | app          | HTTP port (default `3000`)                      |
| `CORS_ORIGIN`          | app          | allowed origins, comma-separated (default `*`)  |
| `NODE_ENV`             | app          | `development` enables Swagger by default        |
| `SWAGGER_ENABLED`      | app          | `true`/`false`; default: on only in development |
| `POSTGRES_HOST`        | app          | DB host                                         |
| `POSTGRES_PORT`        | app, compose | DB port (on the host)                           |
| `POSTGRES_USER`        | app, compose | DB user                                         |
| `POSTGRES_PASSWORD`    | app, compose | DB password                                     |
| `POSTGRES_DATABASE`    | app, compose | DB name                                         |
| `COMPOSE_PROJECT_NAME` | compose      | prefix for containers, volumes and network      |
| `PGADMIN_*`            | compose      | pgAdmin port and login (`--profile tools`)      |
