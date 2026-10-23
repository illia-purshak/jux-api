/**
 * Escapes LIKE/ILIKE wildcards in user input, so they match literally.
 *
 *   `a_b`   → `a\_b`    (otherwise `_` matches any single character: `axb`)
 *   `100%`  → `100\%`   (otherwise `%` matches anything)
 *   `a\b`   → `a\\b`
 *
 * Usage: `ILike(\`%${escapeLike(search)}%\`)`. Backslash is the default escape character in PostgreSQL.
 */
export function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}
