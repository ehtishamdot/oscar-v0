import { Timestamp } from 'firebase-admin/firestore';

export interface SecureMessage {
  id: string;
  patientId: string;
  providerId: string;
  providerEmail: string;
  providerPhone: string;

  // Encrypted payload (AES-256-GCM)
  encryptedPayload: string;      // Base64-encoded ciphertext
  encryptedDataKey: string;      // KEK-encrypted DEK from Cloud KMS
  iv: string;                    // Base64-encoded initialization vector
  authTag: string;               // Base64-encoded authentication tag

  // Metadata
  pathways: string[];
  status: 'pending' | 'accessed' | 'expired';
  createdAt: Timestamp;
  expiresAt: Timestamp;
  accessedAt?: Timestamp;
}

export interface SecureMessageInput {
  patientId: string;
  providerId: string;
  providerEmail: string;
  providerPhone: string;
  pathways: string[];
  intakeData: PatientIntakeData;
}

export interface PatientIntakeData {
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender?: string;
    email: string;
    phone: string;
    street?: string;
    houseNumber?: string;
    postalCode?: string;
    city?: string;
  };
  medical: {
    currentComplaints: string;
    complaintsLocation: string[];
    complaintsDuration?: string;
    previousTreatments?: string;
    medications?: string;
    otherConditions?: string;
  };
  consents: {
    privacy: boolean;
    treatment: boolean;
    dataSharing: boolean;
  };
  // Pathway-specific questionnaire answers
  questionnaireAnswers?: Record<string, Record<string, unknown>>;
}
