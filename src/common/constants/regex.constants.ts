/**
 * Shared validation patterns.
 */

// At least one uppercase letter, one lowercase letter, one digit and one special sign
// (any character that is not a latin letter or a digit), 8+ characters total.
export const REGEX_PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[^A-Za-z0-9]).{8,}$/;

// Letters and digits of any alphabet, no spaces or special signs.
export const REGEX_NO_SPEC_SIGNS = /^[\p{L}\p{N}]+$/u;
