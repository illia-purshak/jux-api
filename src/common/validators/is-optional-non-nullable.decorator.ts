/**
 * Custom class-validator decorators shared across DTOs.
 * One decorator per file, named `<name>.decorator.ts`.
 */

import { ValidateIf } from "class-validator";

/**
 * Like `@IsOptional()`, but only for `undefined`: `null` is still validated.
 *
 * Use it for optional fields backed by NOT NULL columns. With `@IsOptional()`,
 * `{ "name": null }` skips all validators and fails in the DB with a 500.
 *
 *   `{}`                → skipped (field not sent)
 *   `{ "name": null }`  → validated → 400 from `@IsString()`
 *   `{ "name": "x" }`   → validated
 *
 * Usage: `@IsOptionalNonNullable() @IsString() name?: string;`
 */
export function IsOptionalNonNullable(): PropertyDecorator {
  return ValidateIf((_object, value) => value !== undefined);
}
