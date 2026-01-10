import crypto from 'crypto';

// Idle timeout in minutes (session expires after inactivity)
const IDLE_TIMEOUT_MINUTES = 15;

/**
 * Generate a secure session token and ID using cryptographically secure random bytes
 */
export function generateSessionToken(): {
  sessionId: string;
  sessionToken: string;
} {
  // Generate unique session ID (128 bits of entropy, 32 hex characters)
  // Using crypto.randomBytes instead of nanoid for cryptographic security
  const sessionId = crypto.randomBytes(16).toString('hex');

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

/**
 * Check if session is idle (no activity within idle timeout)
 */
export function isSessionIdle(lastActivityAt: Date): boolean {
  const idleTime = Date.now() - lastActivityAt.getTime();
  const idleTimeoutMs = IDLE_TIMEOUT_MINUTES * 60 * 1000;
  return idleTime > idleTimeoutMs;
}

/**
 * Get idle timeout in minutes
 */
export function getIdleTimeoutMinutes(): number {
  return IDLE_TIMEOUT_MINUTES;
}

/**
 * Validate session context (IP and User-Agent)
 * Returns true if context matches or if original context was not recorded
 */
export function validateSessionContext(
  session: {
    ipAddress?: string | null;
    userAgent?: string | null;
  },
  currentIpAddress?: string,
  currentUserAgent?: string
): { valid: boolean; mismatch?: 'ip' | 'userAgent' | 'both' } {
  const ipMismatch = session.ipAddress && currentIpAddress && session.ipAddress !== currentIpAddress;
  const uaMismatch = session.userAgent && currentUserAgent && session.userAgent !== currentUserAgent;

  if (ipMismatch && uaMismatch) {
    return { valid: false, mismatch: 'both' };
  }
  if (ipMismatch) {
    return { valid: false, mismatch: 'ip' };
  }
  if (uaMismatch) {
    return { valid: false, mismatch: 'userAgent' };
  }

  return { valid: true };
}
