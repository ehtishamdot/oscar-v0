import { Timestamp } from 'firebase-admin/firestore';

export interface AccessToken {
  id: string;                    // Document ID = token hash (SHA-256)
  messageId: string;             // Reference to secure_messages
  providerId: string;            // Provider who owns this token

  // Token properties
  tokenHash: string;             // SHA-256 hash of the actual token

  // Lifecycle
  status: 'active' | 'used' | 'expired' | 'revoked';
  createdAt: Timestamp;
  expiresAt: Timestamp;          // 24 hours from creation
  usedAt?: Timestamp;

  // Security tracking
  ipAddress?: string;
  userAgent?: string;
}
