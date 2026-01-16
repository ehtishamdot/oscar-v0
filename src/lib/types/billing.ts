/**
 * Billing System Types
 * For tracking cases and generating invoices
 */

export type PartnerType = 'fysio_partner' | 'ergo_partner' | 'diet_partner' | 'smoking_partner';
export type PathwayType = 'fysio' | 'ergo' | 'diet' | 'smoking' | 'gli';

// Rates per pathway (definitive providers are FREE)
export interface BillingRates {
  fysio_partner: number;  // € per case
  ergo_partner: number;
  diet_partner: number;
  smoking_partner: number;
}

export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: PartnerType;
  companyName?: string;
  address?: {
    street: string;
    city: string;
    postalCode: string;
  };
  kvkNumber?: string;  // Chamber of Commerce
  btwNumber?: string;  // VAT number
  iban?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillableCase {
  id: string;
  referralId: string;
  partnerId: string;
  partnerType: PartnerType;
  pathway: PathwayType;
  patientInitials: string;
  acceptedAt: Date;
  acceptedBy: string;  // Definitive provider ID (free)
  rate: number;  // Rate at time of case
  billed: boolean;
  invoiceId?: string;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;  // e.g., "OSC-2026-0001"
  partnerId: string;
  partnerName: string;
  partnerEmail: string;
  partnerAddress?: {
    street: string;
    city: string;
    postalCode: string;
  };
  period: {
    month: number;  // 1-12
    year: number;
  };
  cases: {
    caseId: string;
    pathway: PathwayType;
    patientInitials: string;
    acceptedAt: Date;
    rate: number;
  }[];
  subtotal: number;
  vatPercentage: number;
  vatAmount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  createdAt: Date;
  sentAt?: Date;
  paidAt?: Date;
}

export interface MonthlyStats {
  month: number;
  year: number;
  totalCases: number;
  casesByPathway: Record<PathwayType, number>;
  casesByPartner: Record<string, number>;
  totalRevenue: number;
  invoicesSent: number;
  invoicesPaid: number;
}

// Default billing rates (in euros)
export const DEFAULT_RATES: BillingRates = {
  fysio_partner: 25,
  ergo_partner: 25,
  diet_partner: 30,
  smoking_partner: 35,
};

// Pathway display names
export const PATHWAY_NAMES: Record<PathwayType, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Diëtetiek',
  smoking: 'Stoppen met Roken',
  gli: 'GLI Programma',
};

// Partner type display names
export const PARTNER_TYPE_NAMES: Record<PartnerType, string> = {
  fysio_partner: 'Fysiotherapie Partner',
  ergo_partner: 'Ergotherapie Partner',
  diet_partner: 'Diëtetiek Partner',
  smoking_partner: 'Stoppen met Roken Partner',
};
