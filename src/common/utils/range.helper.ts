import {
  And,
  Between,
  FindOperator,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
} from "typeorm";

/** Bounds of a range filter; `type` picks the overload and the comparison rules. */
type RangeFilterArgs =
  | { type: 'date'; from?: Date; to?: Date }
  | { type: 'number'; from?: number; to?: number };

/**
 * Builds a TypeORM range filter from optional bounds.
 *
 * Common rules for both types:
 *  - an invalid bound (`Invalid Date`, `NaN`, `Infinity`) is ignored, as if it wasn't passed;
 *  - reversed bounds are swapped: `from=5&to=1` filters `1..5` instead of returning nothing;
 *  - no valid bounds → `undefined`. TypeORM 1.x throws on `undefined` values in `where`,
 *    so only add the result to `where` when it is defined.
 *
 * Dates: `from` is inclusive, `to` is exclusive.
 *   `{ from: May 1, to: May 17 }`  → `And(MoreThanOrEqual(May 1), LessThan(May 17))`
 *   `{ from: May 1 }`              → `MoreThanOrEqual(May 1)`
 *   `{ to: May 17 }`               → `LessThan(May 17)`
 *
 * Numbers: both bounds are inclusive.
 *   `{ from: 1, to: 5 }`  → `Between(1, 5)`
 *   `{ from: 1 }`         → `MoreThanOrEqual(1)`
 *   `{ to: 5 }`           → `LessThanOrEqual(5)`
 *
 * Usage: `toRangeFilter({ type: "date", from: dto.createdAtFrom, to: dto.createdAtTo })`
 */
export function toRangeFilter(
  args: Extract<RangeFilterArgs, { type: 'date' }>,
): FindOperator<Date> | undefined;

export function toRangeFilter(
  args: Extract<RangeFilterArgs, { type: 'number' }>,
): FindOperator<number> | undefined;

export function toRangeFilter(
  args: RangeFilterArgs,
): FindOperator<Date | number> | undefined {
  if (args.type === 'date') {
    let { from, to } = args;

    // `new Date("garbage")` is still a Date, so check the timestamp too.
    const validFrom =
      from instanceof Date && !Number.isNaN(from.getTime());
    const validTo =
      to instanceof Date && !Number.isNaN(to.getTime());

    if (!validFrom && !validTo) return undefined;

    // Drop the invalid bound and keep filtering by the valid one.
    if (!validFrom) from = undefined;
    if (!validTo) to = undefined;

    if (from && to && from > to) {
      [from, to] = [to, from];
    }

    // `Between` is inclusive on both ends, so the date range is combined from two operators.
    if (from && to) {
      return And(
        MoreThanOrEqual(from),
        LessThan(to),
      );
    }

    if (from) return MoreThanOrEqual(from);
    return LessThan(to!);
  }

  let { from, to } = args;

  // `isFinite` rejects `NaN` and `±Infinity` that `Number()` produces from bad input.
  const validFrom = typeof from === 'number' && Number.isFinite(from);
  const validTo = typeof to === 'number' && Number.isFinite(to);

  if (!validFrom && !validTo) return undefined;

  if (!validFrom) from = undefined;
  if (!validTo) to = undefined;

  if (from !== undefined && to !== undefined && from > to) {
    [from, to] = [to, from];
  }

  if (from !== undefined && to !== undefined) {
    return Between(from, to);
  }

  if (from !== undefined) return MoreThanOrEqual(from);
  return LessThanOrEqual(to!);
}
