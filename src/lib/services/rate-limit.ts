import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

// Rate limit configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes block after exceeding

export interface RateLimitResult {
  allowed: boolean;
  remainingAttempts: number;
  blockedUntil: Date | null;
  message: string;
}

/**
 * Check if an IP is rate limited
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  const db = getFirestoreAdmin();
  const docRef = db.collection('rate_limits').doc(ip);
  const doc = await docRef.get();

  if (!doc.exists) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      message: 'OK',
    };
  }

  const data = doc.data();
  if (!data) {
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      message: 'OK',
    };
  }

  // Check if blocked
  if (data.blockedUntil) {
    const blockedUntil = data.blockedUntil.toDate();
    if (new Date() < blockedUntil) {
      const minutesRemaining = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
      return {
        allowed: false,
        remainingAttempts: 0,
        blockedUntil,
        message: `Too many login attempts. Try again in ${minutesRemaining} minutes.`,
      };
    }
    // Block expired, reset
    await docRef.delete();
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      message: 'OK',
    };
  }

  // Check window expiry
  const firstAttemptAt = data.firstAttemptAt?.toDate() || new Date(0);
  const windowExpiry = firstAttemptAt.getTime() + WINDOW_MS;

  if (Date.now() > windowExpiry) {
    // Window expired, reset
    await docRef.delete();
    return {
      allowed: true,
      remainingAttempts: MAX_ATTEMPTS,
      blockedUntil: null,
      message: 'OK',
    };
  }

  // Check attempts
  const attempts = data.attempts || 0;
  const remaining = Math.max(0, MAX_ATTEMPTS - attempts);

  if (attempts >= MAX_ATTEMPTS) {
    return {
      allowed: false,
      remainingAttempts: 0,
      blockedUntil: null,
      message: 'Too many login attempts. Please wait before trying again.',
    };
  }

  return {
    allowed: true,
    remainingAttempts: remaining,
    blockedUntil: null,
    message: 'OK',
  };
}

/**
 * Record a login attempt
 */
export async function recordLoginAttempt(
  ip: string,
  success: boolean
): Promise<void> {
  const db = getFirestoreAdmin();
  const docRef = db.collection('rate_limits').doc(ip);
  const doc = await docRef.get();

  if (success) {
    // Successful login, clear rate limit
    if (doc.exists) {
      await docRef.delete();
    }
    return;
  }

  // Failed login
  if (!doc.exists) {
    // First failed attempt
    await docRef.set({
      ip,
      attempts: 1,
      firstAttemptAt: FieldValue.serverTimestamp(),
      blockedUntil: null,
    });
    return;
  }

  const data = doc.data();
  if (!data) return;

  // Check if window expired
  const firstAttemptAt = data.firstAttemptAt?.toDate() || new Date(0);
  const windowExpiry = firstAttemptAt.getTime() + WINDOW_MS;

  if (Date.now() > windowExpiry) {
    // Reset window
    await docRef.set({
      ip,
      attempts: 1,
      firstAttemptAt: FieldValue.serverTimestamp(),
      blockedUntil: null,
    });
    return;
  }

  // Increment attempts
  const newAttempts = (data.attempts || 0) + 1;

  if (newAttempts >= MAX_ATTEMPTS) {
    // Block the IP
    const blockedUntil = new Date(Date.now() + BLOCK_DURATION_MS);
    await docRef.update({
      attempts: newAttempts,
      blockedUntil: Timestamp.fromDate(blockedUntil),
    });
  } else {
    await docRef.update({
      attempts: newAttempts,
    });
  }
}

/**
 * Clear rate limit for an IP (admin function)
 */
export async function clearRateLimit(ip: string): Promise<void> {
  const db = getFirestoreAdmin();
  await db.collection('rate_limits').doc(ip).delete();
}

/**
 * Clean up old rate limit entries
 */
export async function cleanupRateLimits(): Promise<number> {
  const db = getFirestoreAdmin();
  const cutoff = Timestamp.fromDate(new Date(Date.now() - WINDOW_MS * 2));

  const oldEntries = await db.collection('rate_limits')
    .where('firstAttemptAt', '<', cutoff)
    .get();

  const batch = db.batch();
  oldEntries.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return oldEntries.size;
}
