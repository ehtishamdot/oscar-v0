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

  const previousLogId = recentLogs.empty ? null : recentLogs.docs[0].id;

  // Default values for optional params
  const actorType = params.actorType || 'system';
  const actorId = params.actorId || 'system';
  const resourceId = params.resourceId || 'none';
  const outcome = params.outcome || 'success';

  // Prepare log content for checksum
  const logContent = {
    actorType,
    actorId,
    action: params.action,
    resource: params.resource,
    resourceId,
    details: params.details || {},
    outcome,
    previousLogId,
  };

  // Generate integrity checksum
  const checksum = crypto
    .createHash('sha256')
    .update(JSON.stringify(logContent))
    .digest('hex');

  // Create the log entry - filter out undefined values
  const logRef = db.collection('audit_logs').doc();

  const logData: Record<string, unknown> = {
    actorType,
    actorId,
    action: params.action,
    resource: params.resource,
    resourceId,
    details: params.details || {},
    outcome,
    timestamp: FieldValue.serverTimestamp(),
    previousLogId,
    checksum,
  };

  // Only add optional fields if they have values
  if (params.actorEmail) logData.actorEmail = params.actorEmail;
  if (params.errorMessage) logData.errorMessage = params.errorMessage;
  if (params.ipAddress) logData.ipAddress = params.ipAddress;
  if (params.userAgent) logData.userAgent = params.userAgent;

  await logRef.set(logData);

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
  let previousLogId: string | null = null;

  for (const doc of snapshot.docs) {
    const log = doc.data();

    // Check chain reference (first log has null previousLogId)
    if (previousLogId !== null && log.previousLogId !== previousLogId) {
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
