import { Transform } from "class-transformer";
import { toList } from "./list.helper.js";

const DATE_PREFIX = /^\d{4}-\d{2}(?:-\d{2})?(?:T.*)?$/;
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Converts dates/months into a list of months (`YYYY-MM`).
 *
 *   `?months=2024-05-17`                → `["2024-05"]`
 *   `?months=2024-05-17,2024-06`        → `["2024-05", "2024-06"]`
 *   `?months=2024-05&months=2024-06-01` → `["2024-05", "2024-06"]`
 *   `?months=2024-05-17T10:00:00Z`      → `["2024-05"]`
 *   `?months=hello`                     → `["hello"]`  (not a date, kept as-is, so `@Matches` fails with 400)
 *   `{ "months": [5] }`                 → `[5]`        (non-strings are kept; no crash on `.trim()`)
 *
 * Usage: `@ToMonthArray() @IsArray() @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { each: true })`
 */
export function ToMonthArray(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    const list = toList(value);
    if (!list) return value;
    return list.map((item) =>
      typeof item === "string" && DATE_PREFIX.test(item)
        ? item.slice(0, 7)
        : item,
    );
  });
}

/**
 * Makes a date-only upper bound inclusive: the end of that day (UTC).
 * Without it, `createdTo=2024-05-17` becomes `2024-05-17T00:00` and excludes the whole day.
 *
 *   `?createdTo=2024-05-17`             → `2024-05-17T23:59:59.999Z`
 *   `?createdTo=2024-05-17T10:00:00Z`   → unchanged (an explicit time is respected)
 *   `?createdTo=hello`                  → unchanged (`@IsDate()` fails with 400)
 *
 * Usage: `@ToEndOfDay() @Type(() => Date) @IsDate() createdTo?: Date;`
 */
export function ToEndOfDay(): PropertyDecorator {
  // `@Type(() => Date)` runs before `@Transform`, so `value` may already be a Date:
  // the raw input is read from `obj[key]` to tell a date-only string from an explicit time.
  return Transform(
    ({ value, obj, key }: { value: unknown; obj: unknown; key: string }) => {
      const raw = (obj as Record<string, unknown>)[key];
      if (typeof raw !== "string" || !DATE_ONLY.test(raw.trim())) return value;
      return new Date(`${raw.trim()}T23:59:59.999Z`);
    },
  );
}
