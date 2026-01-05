// Demo data store for Care Coordination Platform
// This is for demonstration purposes - in production, use Firebase/database

export type UserRole = 'patient' | 'coordinator' | 'provider';

export type Patient = {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bsn: string; // Burger Service Nummer
  insurer: string;
  insurerNumber: string;
  createdAt: Date;
  consents: Consent[];
};

export type Consent = {
  id: string;
  type: 'data_processing' | 'share_intake' | 'share_treatment_plan' | 'care_execution';
  granted: boolean;
  timestamp: Date;
  description: string;
};

export type RedFlag = {
  id: string;
  question: string;
  detected: boolean;
  severity: 'high' | 'medium';
  action: string;
};

export type TriageSession = {
  id: string;
  patientId: string;
  answers: Record<string, string>;
  redFlags: RedFlag[];
  hasRedFlags: boolean;
  completedAt: Date;
  carePathways: CarePathway[];
};

export type CarePathway = {
  id: string;
  discipline: 'fysiotherapie' | 'ergotherapie' | 'dietetiek' | 'stoppen_met_roken' | 'psychologie';
  name: string;
  description: string;
  recommended: boolean;
  accepted: boolean | null; // null = not yet decided
  reasonForRecommendation: string;
};

export type IntakeSummary = {
  id: string;
  patientId: string;
  triageSessionId: string;
  discipline: string;
  answers: Record<string, string>;
  summary: string;
  completedAt: Date;
};

export type TreatmentPlan = {
  id: string;
  patientId: string;
  coordinatorId: string;
  intakeSummaryId: string;
  goals: string[];
  disciplines: string[];
  estimatedSessions: number;
  insurerApproved: boolean;
  declarable: boolean;
  status: 'draft' | 'pending_consent' | 'approved' | 'active' | 'completed';
  createdAt: Date;
};

export type CareRequest = {
  id: string;
  treatmentPlanId: string;
  patientId: string;
  providerId: string;
  providerName: string;
  discipline: string;
  status: 'pending' | 'accepted' | 'declined' | 'withdrawn';
  sentAt: Date;
  respondedAt?: Date;
  appointmentDate?: string;
};

export type Provider = {
  id: string;
  name: string;
  discipline: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  acceptsNewPatients: boolean;
  insurers: string[]; // Accepted insurers
};

export type AuditLog = {
  id: string;
  userId: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  timestamp: Date;
};

// Demo insurers in Netherlands
export const INSURERS = [
  'Zilveren Kruis',
  'VGZ',
  'CZ',
  'Menzis',
  'ONVZ',
  'DSW',
  'FBTO',
  'Interpolis',
  'Nationale-Nederlanden',
  'Anderzorg',
];

// Demo providers
export const DEMO_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'Fysiotherapie Amsterdam Noord',
    discipline: 'fysiotherapie',
    address: 'Buikslotermeerplein 12',
    city: 'Amsterdam',
    phone: '020-1234567',
    email: 'info@fysioamsterdamnoord.nl',
    acceptsNewPatients: true,
    insurers: ['Zilveren Kruis', 'VGZ', 'CZ', 'Menzis'],
  },
  {
    id: 'prov-2',
    name: 'Praktijk de Beweging',
    discipline: 'fysiotherapie',
    address: 'Kinkerstraat 45',
    city: 'Amsterdam',
    phone: '020-2345678',
    email: 'contact@praktijkdebeweging.nl',
    acceptsNewPatients: true,
    insurers: ['Zilveren Kruis', 'VGZ', 'ONVZ', 'DSW'],
  },
  {
    id: 'prov-3',
    name: 'FysioFit Utrecht',
    discipline: 'fysiotherapie',
    address: 'Vredenburg 100',
    city: 'Utrecht',
    phone: '030-3456789',
    email: 'info@fysiofitutrecht.nl',
    acceptsNewPatients: true,
    insurers: ['VGZ', 'CZ', 'Menzis', 'Interpolis'],
  },
  {
    id: 'prov-4',
    name: 'Ergotherapie Centrum',
    discipline: 'ergotherapie',
    address: 'Spui 15',
    city: 'Den Haag',
    phone: '070-4567890',
    email: 'info@ergocentrum.nl',
    acceptsNewPatients: true,
    insurers: ['Zilveren Kruis', 'VGZ', 'CZ', 'Menzis', 'ONVZ'],
  },
  {
    id: 'prov-5',
    name: 'Dieetadvies Rotterdam',
    discipline: 'dietetiek',
    address: 'Coolsingel 200',
    city: 'Rotterdam',
    phone: '010-5678901',
    email: 'info@dieetadviesrotterdam.nl',
    acceptsNewPatients: true,
    insurers: ['Zilveren Kruis', 'VGZ', 'CZ', 'Menzis', 'DSW'],
  },
];

// Care pathway definitions
export const CARE_PATHWAY_DEFINITIONS: Omit<CarePathway, 'id' | 'recommended' | 'accepted' | 'reasonForRecommendation'>[] = [
  {
    discipline: 'fysiotherapie',
    name: 'Fysiotherapie',
    description: 'Behandeling door een fysiotherapeut voor verbetering van beweging, kracht en pijnvermindering. Inclusief oefentherapie en advies voor thuis.',
  },
  {
    discipline: 'ergotherapie',
    name: 'Ergotherapie',
    description: 'Hulp bij dagelijkse activiteiten zoals aankleden, koken of werken. Een ergotherapeut leert u nieuwe manieren om dingen te doen en adviseert over hulpmiddelen.',
  },
  {
    discipline: 'dietetiek',
    name: 'Dieetadvies',
    description: 'Persoonlijk voedingsadvies van een diëtist om ontstekingen te verminderen, een gezond gewicht te bereiken en uw klachten te verminderen.',
  },
  {
    discipline: 'stoppen_met_roken',
    name: 'Stoppen met Roken',
    description: 'Professionele begeleiding om te stoppen met roken. Roken verergert gewrichtsklachten en vertraagt herstel.',
  },
  {
    discipline: 'psychologie',
    name: 'Psychologische Ondersteuning',
    description: 'Hulp bij het omgaan met chronische pijn en de impact daarvan op uw dagelijks leven en stemming.',
  },
];

// Red flag questions for triage
export const RED_FLAG_QUESTIONS = [
  {
    id: 'rf-1',
    question: 'Heeft u onverklaarbaar gewichtsverlies (meer dan 5 kg in de afgelopen maanden)?',
    severity: 'high' as const,
    action: 'Direct doorverwijzen naar huisarts voor nader onderzoek',
  },
  {
    id: 'rf-2',
    question: 'Heeft u koorts in combinatie met uw gewrichtsklachten?',
    severity: 'high' as const,
    action: 'Direct doorverwijzen naar huisarts - mogelijke infectie',
  },
  {
    id: 'rf-3',
    question: 'Is er sprake van plotselinge, ernstige zwelling van een gewricht?',
    severity: 'high' as const,
    action: 'Spoedverwijzing huisarts - mogelijke septische artritis',
  },
  {
    id: 'rf-4',
    question: 'Heeft u gevoelloosheid of tintelingen in uw ledematen?',
    severity: 'medium' as const,
    action: 'Verwijzing huisarts voor neurologisch onderzoek',
  },
  {
    id: 'rf-5',
    question: 'Heeft u nachtelijke pijn die u wakker maakt en niet vermindert in rust?',
    severity: 'medium' as const,
    action: 'Verwijzing huisarts voor nader onderzoek',
  },
];

// Generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Demo audit logger
export function logAudit(
  userId: string,
  userRole: UserRole,
  action: string,
  resource: string,
  resourceId: string,
  details: string
): AuditLog {
  const log: AuditLog = {
    id: generateId(),
    userId,
    userRole,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date(),
  };

  // In demo, just log to console
  console.log('[AUDIT]', log);
  return log;
}
