/**
 * Uber-style Patient Referral System Types
 * Allows sending patient referrals to multiple nearby therapists
 * First to accept gets the patient
 */

export type ReferralStatus = 'open' | 'accepted' | 'expired' | 'cancelled';
export type InviteStatus = 'pending' | 'viewed' | 'accepted' | 'declined' | 'expired';
export type TherapistType = 'fysio' | 'ergo' | 'diet' | 'other';

export interface Referral {
  id: string;
  // Patient info (minimal, encrypted separately)
  patientId: string;
  patientInitials: string;
  patientCity: string;
  pathways: string[];

  // Referral details
  urgency: 'normal' | 'urgent';
  notes?: string;

  // Status tracking
  status: ReferralStatus;
  acceptedBy?: string; // providerId who accepted
  acceptedAt?: Date;

  // Metadata
  createdBy: string; // coordinator/partner ID
  createdAt: Date;
  expiresAt: Date;

  // Encrypted patient data reference
  encryptedDataId: string;
}

export interface ReferralInvite {
  id: string;
  referralId: string;

  // Provider info
  providerId: string;
  providerEmail: string;
  providerName: string;
  providerType: TherapistType;

  // Invite token (for secure link)
  inviteToken: string;
  inviteTokenHash: string;

  // Status
  status: InviteStatus;
  viewedAt?: Date;
  respondedAt?: Date;

  // Metadata
  sentAt: Date;
  expiresAt: Date;
}

export interface CreateReferralParams {
  patientId: string;
  patientInitials: string;
  patientCity: string;
  pathways: string[];
  urgency: 'normal' | 'urgent';
  notes?: string;
  createdBy: string;

  // Encrypted patient data
  intakeData: Record<string, unknown>;

  // Target providers (up to 5)
  providers: {
    providerId: string;
    providerEmail: string;
    providerName: string;
    providerType: TherapistType;
  }[];
}

export interface ReferralEmailParams {
  to: string;
  providerName: string;
  patientInitials: string;
  patientCity: string;
  pathways: string[];
  urgency: 'normal' | 'urgent';
  viewUrl: string;
  statusBadgeUrl: string;
  expiresAt: Date;
}
