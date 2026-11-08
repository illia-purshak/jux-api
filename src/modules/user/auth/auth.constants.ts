import type { CookieOptions } from 'express';
import { MS_PER_DAY } from '@constants/time.constants.js';

export const BCRYPT_SALT_ROUNDS = 10;

export const REFRESH_TOKEN_TTL_MS = 7 * MS_PER_DAY;

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Shared by set and clear: the browser only removes a cookie when path/domain/flags match.
export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid name/email or password',
  USER_EXISTS: 'User with this name or email already exists',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
} as const;
