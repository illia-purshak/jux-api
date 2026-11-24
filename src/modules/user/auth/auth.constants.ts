import type { CookieOptions } from 'express';
import { MS_PER_DAY } from '@constants/time.constants.js';

export const BCRYPT_SALT_ROUNDS = 10;

export const REFRESH_TOKEN_TTL_MS = 7 * MS_PER_DAY;

export const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const REFRESH_TOKEN_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const isInDevMode = process.env.NODE_ENV === 'development';

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid name/email or password',
  USER_EXISTS: 'User with this name or email already exists',
  INVALID_REFRESH_TOKEN: isInDevMode && 'Invalid or expired refresh token',
  CREDENTIALS_NOT_FOUND: 'User credentials not found',
  REGISTERED_BUT_LOGIN_FAILED: 'Registration successful, but failed to sign in',
  MISSING_TOKEN: isInDevMode && 'Missing or malformed Authorization header',
} as const;
