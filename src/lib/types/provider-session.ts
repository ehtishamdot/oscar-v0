import { Timestamp } from 'firebase-admin/firestore';

export interface ProviderSession {
  id: string;                    // Session ID (secure random)
  messageId: string;             // Reference to secure_messages
  providerId: string;

  // Session properties
  sessionToken: string;          // Hashed session token

  // Lifecycle
  status: 'active' | 'expired' | 'terminated';
  createdAt: Timestamp;
  expiresAt: Timestamp;          // 30 minutes from creation
  lastActivityAt: Timestamp;

  // Security context
  ipAddress: string;
  userAgent: string;

  // Content access tracking
  contentAccessedAt?: Timestamp;
  contentDownloadedAt?: Timestamp;
}
