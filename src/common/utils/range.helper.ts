/**
 * Shared helpers for building TypeORM queries.
 */

import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";

/**
 * Builds a TypeORM range filter from optional bounds (both inclusive).
 *
 *   `(1, 5)`          → `Between(1, 5)`
 *   `(1, undefined)`  → `MoreThanOrEqual(1)`
 *   `(undefined, 5)`  → `LessThanOrEqual(5)`
 *   `()`              → `undefined`
 *
 * TypeORM 1.x throws on `undefined` values in `where`, so only add the result
 * to `where` when it is defined.
 */
export function toRangeFilter<T>(
  from?: T,
  to?: T,
): FindOperator<T> | undefined {
  if (from !== undefined && to !== undefined) return Between(from, to);
  if (from !== undefined) return MoreThanOrEqual(from);
  if (to !== undefined) return LessThanOrEqual(to);
  return undefined;
}
