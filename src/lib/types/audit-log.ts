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
  | 'SESSION_TERMINATED'
  // Admin actions
  | 'ADMIN_LOGIN_SUCCESS'
  | 'ADMIN_LOGIN_FAILED'
  | 'ADMIN_LOGIN_BLOCKED'
  | 'ADMIN_LOGOUT'
  | 'ADMIN_SESSION_EXPIRED'
  | 'ADMIN_PARTNER_CREATED'
  | 'ADMIN_PARTNER_UPDATED'
  | 'ADMIN_PARTNER_DELETED'
  | 'ADMIN_INVOICE_GENERATED'
  | 'ADMIN_INVOICE_STATUS_CHANGED'
  | 'ADMIN_DATA_IMPORTED'
  | 'ADMIN_API_UNAUTHORIZED';

export type AuditResource =
  | 'secure_message'
  | 'access_token'
  | 'verification_code'
  | 'provider_session'
  | 'patient_data'
  | 'admin_session'
  | 'partner'
  | 'invoice';

export type AuditActorType = 'system' | 'patient' | 'provider' | 'coordinator' | 'admin';

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
  actorType?: AuditActorType;
  actorId?: string;
  actorEmail?: string;
  action: AuditAction | string;
  resource: AuditResource | string;
  resourceId?: string;
  details?: Record<string, unknown>;
  outcome?: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}
