/**
 * Shared validation patterns.
 */

// Latin letters and digits only, no special signs or spaces.
// At least one uppercase letter, one lowercase letter and one digit, 8+ characters total.
export const REGEX_PASSWORD = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])[A-Za-z0-9]{8,}$/;

// Letters and digits of any alphabet, no spaces or special signs.
export const REGEX_NO_SPEC_SIGNS = /^[\p{L}\p{N}]+$/u;
