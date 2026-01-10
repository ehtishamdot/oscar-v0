import crypto from 'crypto';
import { nanoid } from 'nanoid';

/**
 * Generate a secure session token and ID
 */
export function generateSessionToken(): {
  sessionId: string;
  sessionToken: string;
} {
  // Generate unique session ID (32 characters)
  const sessionId = nanoid(32);

  // Generate session token (256 bits, hashed for storage)
  const tokenBytes = crypto.randomBytes(32);
  const sessionToken = crypto
    .createHash('sha256')
    .update(tokenBytes)
    .digest('hex');

  return { sessionId, sessionToken };
}

/**
 * Get session expiry date (default 30 minutes)
 */
export function getSessionExpiry(minutesFromNow?: number): Date {
  const minutes = minutesFromNow ?? 30;
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if session is expired
 */
export function isSessionExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Get remaining session time in minutes
 */
export function getRemainingSessionMinutes(expiresAt: Date): number {
  const remaining = expiresAt.getTime() - Date.now();
  return Math.max(0, Math.floor(remaining / 60000));
}
