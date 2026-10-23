/**
 * class-transformer decorators for DTOs (mostly query params, which always arrive as strings).
 *
 * Conventions:
 *  - every helper is a decorator factory named `To<Result>()`: `@ToStringArray()`, `@ToBoolean()`;
 *  - transformers only convert: values they can't convert are passed through unchanged,
 *    so class-validator rejects them with a regular 400 (no throwing, no silent defaults);
 *  - pair each transformer with a validator (`@IsArray()`, `@IsInt({ each: true })`, ...).
 *
 * Import from `@utils/transformers`.
 */

export * from "./array.transformers.js";
export * from "./boolean.transformers.js";
export * from "./date.transformers.js";
export * from "./json.transformers.js";
