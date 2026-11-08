import { hash } from 'crypto';

/**
 * SHA-256 hex digest. Fast and deterministic — fine for high-entropy random tokens
 * (refresh tokens), NOT for passwords (use bcrypt for those).
 */
export function sha256(value: string): string {
  return hash('sha256', value);
}
