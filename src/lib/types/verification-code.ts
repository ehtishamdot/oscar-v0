import { Timestamp } from 'firebase-admin/firestore';

export interface VerificationCode {
  id: string;
  tokenHash: string;             // Reference to access_tokens
  messageId: string;             // Reference to secure_messages
  providerId: string;

  // Code properties
  codeHash: string;              // SHA-256 hash of the 6-digit code

  // Lifecycle
  status: 'pending' | 'verified' | 'expired' | 'blocked';
  createdAt: Timestamp;
  expiresAt: Timestamp;          // 10 minutes from creation
  verifiedAt?: Timestamp;

  // Rate limiting
  attempts: number;              // Current attempt count (max 5)
  lastAttemptAt?: Timestamp;

  // Delivery tracking
  deliveryMethod: 'email' | 'sms';
  deliveredAt?: Timestamp;
  deliveryStatus: 'pending' | 'sent' | 'failed';
}
