import crypto from 'crypto';

/**
 * Generate a secure invite token for referral links
 */
export function generateInviteToken(): {
  token: string;
  tokenHash: string;
} {
  const tokenBytes = crypto.randomBytes(24);
  const token = tokenBytes.toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

/**
 * Hash an invite token for lookup
 */
export function hashInviteToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Get referral expiry (default 48 hours for urgent, 7 days for normal)
 */
export function getReferralExpiry(urgency: 'normal' | 'urgent'): Date {
  const hours = urgency === 'urgent' ? 48 : 168; // 48h or 7 days
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}

/**
 * Get invite expiry (same as referral)
 */
export function getInviteExpiry(urgency: 'normal' | 'urgent'): Date {
  return getReferralExpiry(urgency);
}

/**
 * Format pathways for display
 */
const pathwayNames: Record<string, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Voedingsbegeleiding',
  smoking: 'Stoppen met Roken',
  gli: 'GLI Programma',
};

export function formatPathways(pathways: string[]): string {
  return pathways.map(p => pathwayNames[p] || p).join(', ');
}

/**
 * Format urgency for display
 */
export function formatUrgency(urgency: 'normal' | 'urgent'): string {
  return urgency === 'urgent' ? 'Spoed' : 'Normaal';
}
