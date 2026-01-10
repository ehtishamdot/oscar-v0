import { Timestamp } from 'firebase-admin/firestore';

export type AuditAction =
  | 'MESSAGE_CREATED'
  | 'MESSAGE_ENCRYPTED'
  | 'TOKEN_GENERATED'
  | 'NOTIFICATION_SENT'
  | 'TOKEN_VALIDATED'
  | 'TOKEN_EXPIRED'
  | 'CODE_GENERATED'
  | 'CODE_SENT'
  | 'CODE_VERIFIED'
  | 'CODE_FAILED'
  | 'CODE_BLOCKED'
  | 'SESSION_CREATED'
  | 'SESSION_CONTEXT_MISMATCH'  // IP/User-Agent changed during session
  | 'SESSION_IDLE_EXPIRED'      // Session expired due to inactivity
  | 'CONTENT_DECRYPTED'
  | 'CONTENT_ACCESSED'
  | 'CONTENT_DOWNLOADED'
  | 'SESSION_EXPIRED'
  | 'SESSION_TERMINATED';

export type AuditResource =
  | 'secure_message'
  | 'access_token'
  | 'verification_code'
  | 'provider_session'
  | 'patient_data';

export type AuditActorType = 'system' | 'patient' | 'provider' | 'coordinator';

export interface AuditLogEntry {
  id: string;
  timestamp: Timestamp;

  // Actor
  actorType: AuditActorType;
  actorId: string;
  actorEmail?: string;

  // Action
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;

  // Context
  ipAddress?: string;
  userAgent?: string;

  // Details
  details: Record<string, unknown>;
  outcome: 'success' | 'failure';
  errorMessage?: string;

  // Data integrity (append-only chain)
  previousLogId?: string;
  checksum: string;              // SHA-256 of log content
}

export interface CreateAuditLogParams {
  actorType: AuditActorType;
  actorId: string;
  actorEmail?: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  details?: Record<string, unknown>;
  outcome: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}
