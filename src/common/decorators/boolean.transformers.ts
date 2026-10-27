import { Transform } from "class-transformer";

const TRUE_VALUES = new Set(["true", "1"]);
const FALSE_VALUES = new Set(["false", "0"]);

/**
 * Converts a query/form value into `boolean`.
 *
 *   `?active=true` / `?active=1`   → `true`
 *   `?active=false` / `?active=0`  → `false`
 *   `?active=TRUE`                 → `true`       (case-insensitive, trimmed)
 *   `?active=`                     → `undefined`  (treated as "not set" by `@IsOptional()`)
 *   `{ "active": true }`           → `true`       (real booleans pass through)
 *   `?active=yes` / `?active=no`   → `"yes"` / `"no"`  (unknown values are kept, so `@IsBoolean()` fails with 400;
 *                                                       a plain `Boolean("no")` would silently give `true`)
 *   `{ "active": 2 }`              → `2`          (unknown numbers are kept as-is too)
 *
 * Usage: `@IsOptional() @ToBoolean() @IsBoolean()`
 */
export function ToBoolean(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string" && typeof value !== "number") return value;

    const normalized = String(value).trim().toLowerCase();
    if (normalized === "") return undefined;
    if (TRUE_VALUES.has(normalized)) return true;
    if (FALSE_VALUES.has(normalized)) return false;
    return value;
  });
}
