import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import { sendSMS } from './sms';

// Initialize SendGrid (lazy)
let sgInitialized = false;
function initSendGrid() {
  if (!sgInitialized && process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    sgInitialized = true;
  }
}

/**
 * Generate a cryptographically secure 6-digit verification code
 */
export function generateVerificationCode(): {
  code: string;
  codeHash: string;
} {
  // Generate cryptographically secure 6-digit code
  const randomBytes = crypto.randomBytes(4);
  const randomNumber = randomBytes.readUInt32BE(0);
  const code = String(randomNumber % 1000000).padStart(6, '0');

  // Hash the code for storage
  const codeHash = hashCode(code);

  return { code, codeHash };
}

/**
 * Hash a verification code using SHA-256
 */
export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex');
}

/**
 * Get code expiry date (default 10 minutes)
 */
export function getCodeExpiry(minutesFromNow?: number): Date {
  const minutes = minutesFromNow ?? parseInt(process.env.CODE_EXPIRY_MINUTES || '10', 10);
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Get maximum code attempts (default 5)
 */
export function getMaxCodeAttempts(): number {
  return parseInt(process.env.CODE_MAX_ATTEMPTS || '5', 10);
}

export interface SendVerificationCodeParams {
  method: 'email' | 'sms';
  recipient: string;
  code: string;
}

/**
 * Send verification code via email or SMS
 */
export async function sendVerificationCode(params: SendVerificationCodeParams): Promise<void> {
  const { method, recipient, code } = params;

  if (method === 'email') {
    await sendVerificationCodeEmail(recipient, code);
  } else {
    await sendVerificationCodeSMS(recipient, code);
  }
}

async function sendVerificationCodeEmail(to: string, code: string): Promise<void> {
  initSendGrid();

  await sgMail.send({
    to: to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@oscar-zorg.nl',
      name: process.env.SENDGRID_FROM_NAME || 'Oscar Zorgcoordinatie',
    },
    subject: 'Oscar - Uw verificatiecode',
    text: `Uw verificatiecode is: ${code}\n\nDeze code is 10 minuten geldig.\n\nAls u deze code niet heeft aangevraagd, kunt u dit bericht negeren.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Oscar</h1>
          <p style="margin: 5px 0 0;">Zorgcoordinatie Platform</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Uw verificatiecode</h2>

          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px;">
            ${code}
          </div>

          <p style="color: #666; font-size: 14px;">Deze code is 10 minuten geldig.</p>

          <p style="color: #999; font-size: 12px;">Als u deze code niet heeft aangevraagd, kunt u dit bericht negeren.</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">Oscar Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Dit is een beveiligd bericht.</p>
        </div>
      </div>
    `,
  });
}

async function sendVerificationCodeSMS(to: string, code: string): Promise<void> {
  await sendSMS({
    to: to,
    message: `Uw Oscar verificatiecode is: ${code}. Deze code is 10 minuten geldig.`,
  });
}
