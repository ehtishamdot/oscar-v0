import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Session configuration
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export interface AdminSession {
  id: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
  ipAddress: string;
  userAgent: string;
  csrfToken: string;
}

/**
 * Generate a secure random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a CSRF token
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create a new admin session in Firestore
 */
export async function createAdminSession(
  ipAddress: string,
  userAgent: string
): Promise<{ sessionToken: string; csrfToken: string; expiresAt: Date }> {
  const db = getFirestoreAdmin();

  const sessionToken = generateToken();
  const csrfToken = generateCsrfToken();
  const tokenHash = await bcrypt.hash(sessionToken, 10);

  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_MS);

  const sessionData = {
    tokenHash,
    csrfToken,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    lastActivityAt: FieldValue.serverTimestamp(),
    ipAddress,
    userAgent,
  };

  const docRef = await db.collection('admin_sessions').add(sessionData);

  return {
    sessionToken: `${docRef.id}:${sessionToken}`,
    csrfToken,
    expiresAt,
  };
}

/**
 * Validate an admin session token
 * Returns session data if valid, null if invalid
 */
export async function validateAdminSession(
  token: string
): Promise<AdminSession | null> {
  if (!token) return null;

  // Token format: sessionId:tokenValue
  const parts = token.split(':');
  if (parts.length !== 2) return null;

  const [sessionId, tokenValue] = parts;

  const db = getFirestoreAdmin();
  const sessionDoc = await db.collection('admin_sessions').doc(sessionId).get();

  if (!sessionDoc.exists) return null;

  const data = sessionDoc.data();
  if (!data) return null;

  // Verify token hash
  const isValidToken = await bcrypt.compare(tokenValue, data.tokenHash);
  if (!isValidToken) return null;

  // Check expiration
  const expiresAt = data.expiresAt?.toDate?.() || new Date(0);
  if (new Date() > expiresAt) {
    // Session expired, delete it
    await sessionDoc.ref.delete();
    return null;
  }

  // Check inactivity timeout
  const lastActivityAt = data.lastActivityAt?.toDate?.() || new Date(0);
  const inactiveFor = Date.now() - lastActivityAt.getTime();
  if (inactiveFor > INACTIVITY_TIMEOUT_MS) {
    // Inactive too long, delete session
    await sessionDoc.ref.delete();
    return null;
  }

  return {
    id: sessionDoc.id,
    tokenHash: data.tokenHash,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    expiresAt,
    lastActivityAt,
    ipAddress: data.ipAddress || '',
    userAgent: data.userAgent || '',
    csrfToken: data.csrfToken || '',
  };
}

/**
 * Update the last activity timestamp for a session
 */
export async function updateSessionActivity(sessionId: string): Promise<void> {
  const db = getFirestoreAdmin();
  await db.collection('admin_sessions').doc(sessionId).update({
    lastActivityAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Terminate an admin session
 */
export async function terminateAdminSession(token: string): Promise<boolean> {
  if (!token) return false;

  const parts = token.split(':');
  if (parts.length !== 2) return false;

  const [sessionId] = parts;

  const db = getFirestoreAdmin();
  try {
    await db.collection('admin_sessions').doc(sessionId).delete();
    return true;
  } catch {
    return false;
  }
}

/**
 * Clean up expired sessions (call periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const db = getFirestoreAdmin();
  const now = Timestamp.now();

  const expiredSessions = await db.collection('admin_sessions')
    .where('expiresAt', '<', now)
    .get();

  const batch = db.batch();
  expiredSessions.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return expiredSessions.size;
}

/**
 * Verify CSRF token matches session
 */
export async function verifyCsrfToken(
  sessionToken: string,
  csrfToken: string
): Promise<boolean> {
  const session = await validateAdminSession(sessionToken);
  if (!session) return false;
  return session.csrfToken === csrfToken;
}
