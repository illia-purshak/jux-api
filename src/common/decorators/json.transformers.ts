import { Transform } from "class-transformer";

/**
 * Parses a JSON string (typically a query param or multipart/form-data field).
 *
 *   `?ids=["a","b"]`        → `["a", "b"]`
 *   `?filter={"x":1}`       → `{ x: 1 }`
 *   `{ "ids": ["a", "b"] }` → `["a", "b"]`  (already parsed values pass through)
 *   `?ids=`                 → `undefined`   (treated as "not set" by `@IsOptional()`)
 *   `?ids=[oops`            → `"[oops"`     (invalid JSON is kept, so `@IsArray()`/`@IsObject()` fail with 400)
 *
 * The transformer only parses; the shape is checked by validators, e.g. a UUID array:
 * `@ToJsonValue() @IsArray() @IsUUID("all", { each: true })`
 */
export function ToJsonValue(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }) => {
    if (typeof value !== "string") return value;
    if (value.trim() === "") return undefined;
    try {
      return JSON.parse(value) as unknown;
    } catch {
      return value;
    }
  });
}
