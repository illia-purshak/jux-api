/**
 * Normalizes a "list" value from a query string or body into a flat array.
 *
 * Handles:
 *  - comma-separated string:   `"a, b"`              → `["a", "b"]`
 *  - repeated query param:     `["a", "b"]`          → `["a", "b"]`
 *  - both at once:             `["a,b", "c"]`        → `["a", "b", "c"]`
 *  - single number:            `5`                   → `[5]`
 *  - empty items are dropped:  `"a,,b,"`             → `["a", "b"]`
 *  - non-string items are kept as-is, so validators (`{ each: true }`) report them.
 *
 * Returns `undefined` for anything else (null, objects, booleans),
 * so the caller can pass the original value through to validation.
 */
export function toList(
  value: unknown,
  separator: string | false = ",",
): unknown[] | undefined {
  if (typeof value === "string" || typeof value === "number") value = [value];
  if (!Array.isArray(value)) return undefined;

  return (value as unknown[])
    .flatMap((item) =>
      typeof item === "string" && separator ? item.split(separator) : [item],
    )
    .map((item) => (typeof item === "string" ? item.trim() : item))
    .filter((item) => item !== "");
}
