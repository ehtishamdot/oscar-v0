import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import crypto from 'crypto';
import type { AuditLogEntry, CreateAuditLogParams, AuditResource } from '@/lib/types/audit-log';

/**
 * Create an immutable audit log entry
 * Implements append-only logging with integrity checksums
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<string> {
  const db = getFirestoreAdmin();

  // Get the most recent log for chain reference
  const recentLogs = await db.collection('audit_logs')
    .orderBy('timestamp', 'desc')
    .limit(1)
    .get();

  const previousLogId = recentLogs.empty ? undefined : recentLogs.docs[0].id;

  // Prepare log content for checksum
  const logContent = {
    actorType: params.actorType,
    actorId: params.actorId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId,
    details: params.details || {},
    outcome: params.outcome,
    previousLogId,
  };

  // Generate integrity checksum
  const checksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(logContent))
    .digest('hex');

  // Create the log entry
  const logRef = db.collection('audit_logs').doc();

  await logRef.set({
    ...params,
    details: params.details || {},
    timestamp: FieldValue.serverTimestamp(),
    previousLogId,
    checksum,
  });

  return logRef.id;
}

/**
 * Query audit logs for a specific resource
 */
export async function getAuditLogsForResource(
  resource: AuditResource,
  resourceId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = getFirestoreAdmin();

  const snapshot = await db.collection('audit_logs')
    .where('resource', '==', resource)
    .where('resourceId', '==', resourceId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLogEntry[];
}

/**
 * Query audit logs for a specific actor
 */
export async function getAuditLogsForActor(
  actorId: string,
  limit: number = 100
): Promise<AuditLogEntry[]> {
  const db = getFirestoreAdmin();

  const snapshot = await db.collection('audit_logs')
    .where('actorId', '==', actorId)
    .orderBy('timestamp', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as AuditLogEntry[];
}

/**
 * Verify audit log chain integrity
 * Returns errors if any logs have been tampered with
 */
export async function verifyAuditLogIntegrity(
  startLogId?: string,
  limit: number = 1000
): Promise<{ valid: boolean; errors: string[] }> {
  const db = getFirestoreAdmin();
  const errors: string[] = [];

  let query = db.collection('audit_logs')
    .orderBy('timestamp', 'asc')
    .limit(limit);

  if (startLogId) {
    const startDoc = await db.collection('audit_logs').doc(startLogId).get();
    if (startDoc.exists) {
      query = query.startAfter(startDoc);
    }
  }

  const snapshot = await query.get();
  let previousLogId: string | undefined;

  for (const doc of snapshot.docs) {
    const log = doc.data();

    // Check chain reference
    if (previousLogId && log.previousLogId !== previousLogId) {
      errors.push(`Chain broken at log ${doc.id}: expected previousLogId ${previousLogId}, got ${log.previousLogId}`);
    }

    // Verify checksum
    const logContent = {
      actorType: log.actorType,
      actorId: log.actorId,
      action: log.action,
      resource: log.resource,
      resourceId: log.resourceId,
      details: log.details || {},
      outcome: log.outcome,
      previousLogId: log.previousLogId,
    };

    const expectedChecksum = crypto
      .createHash('sha256')
      .update(JSON.stringify(logContent))
      .digest('hex');

    if (log.checksum !== expectedChecksum) {
      errors.push(`Checksum mismatch at log ${doc.id}`);
    }

    previousLogId = doc.id;
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
