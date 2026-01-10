import crypto from 'crypto';

/**
 * Generate a cryptographically secure access token
 * Requirements: >= 128 bits entropy (using 256 bits for extra security)
 */
export function generateAccessToken(): {
  token: string;
  tokenHash: string;
} {
  // Generate 32 bytes (256 bits) of random data
  const tokenBytes = crypto.randomBytes(32);

  // Encode as URL-safe base64
  const token = tokenBytes.toString('base64url');

  // Create SHA-256 hash for storage (never store the actual token)
  const tokenHash = hashToken(token);

  return { token, tokenHash };
}

/**
 * Hash a token using SHA-256
 * Used for both storage and lookup
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get token expiry date (default 24 hours)
 */
export function getTokenExpiry(hoursFromNow?: number): Date {
  const hours = hoursFromNow ?? parseInt(process.env.TOKEN_EXPIRY_HOURS || '24', 10);
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Check if a token has expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}
