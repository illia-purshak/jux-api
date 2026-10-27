import { Transform } from "class-transformer";
import { toList } from "./list.helper.js";

const DECIMAL = /^-?\d+(?:\.\d+)?$/;

/**
 * Converts a list param into `string[]`.
 *
 *   `?tags=a,b`           → `["a", "b"]`
 *   `?tags=a&tags=b`      → `["a", "b"]`
 *   `?tags=a, b&tags=c`   → `["a", "b", "c"]`
 *   `?tags=`              → `[]`
 *   `{ "tags": [1, "x"] }` → `["1", "x"]`
 *
 * Pass `{ separator: false }` to keep commas inside values: `?names=Doe, John` → `["Doe, John"]`.
 * Anything that is not a string/number/array is passed through unchanged for validators.
 *
 * Usage: `@ToStringArray() @IsArray() @IsString({ each: true })`
 */
export function ToStringArray(
  options: { separator?: string | false } = {},
): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    const list = toList(value, options.separator ?? ",");
    if (!list) return value;
    return list.map((item) => (typeof item === "number" ? String(item) : item));
  });
}

/**
 * Converts a list param into `number[]`.
 *
 *   `?ids=1,2`        → `[1, 2]`
 *   `?ids=1&ids=2`    → `[1, 2]`
 *   `?ids=1.5,-3`     → `[1.5, -3]`
 *   `?ids=1,,2`       → `[1, 2]`        (empty items are dropped, not turned into 0)
 *   `?ids=1,abc`      → `[1, "abc"]`    (invalid items are kept, so `@IsInt({ each: true })` fails with 400)
 *   `?ids=12abc`      → `["12abc"]`     (no silent `parseInt` truncation to 12)
 *   `?ids=0x10,1e3`   → `["0x10", "1e3"]` (only plain decimals are converted, no hex/exponent surprises)
 *
 * Usage: `@ToNumberArray() @IsArray() @IsInt({ each: true })`
 */
export function ToNumberArray(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    const list = toList(value);
    if (!list) return value;
    return list.map((item) => {
      if (typeof item !== "string" || !DECIMAL.test(item)) return item;
      return Number(item);
    });
  });
}
