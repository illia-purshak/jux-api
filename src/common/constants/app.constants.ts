/**
 * Global application constants.
 *
 * What belongs here:
 *  - immutable values used in several places (prefixes, limits, defaults);
 *  - fallback values for environment variables (`process.env.X ?? DEFAULT_X`);
 *  - DI tokens (`export const SOME_TOKEN = Symbol('SOME_TOKEN')`).
 *
 * What does NOT belong here:
 *  - secrets (passwords, keys) — environment variables only;
 *  - constants needed by a single module — keep them next to the module
 *    (`src/modules/<name>/<name>.constants.ts`).
 *
 * Put new groups of constants into separate files: `pagination.constants.ts`, `roles.constants.ts`, etc.
 */

export const API_PREFIX = "api/v1";

export const DEFAULT_PORT = 3000;

// Swagger UI path; the JSON spec is served at `${SWAGGER_PATH}-json`.
export const SWAGGER_PATH = "docs";

export const CORS_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";
export const CORS_ALLOWED_HEADERS = "Content-Type, Accept, Authorization";
