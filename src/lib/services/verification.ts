import crypto from 'crypto';
import nodemailer from 'nodemailer';

// SMTP transporter (lazy initialization)
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.yourdomain.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false', // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
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
  method: 'email';
  recipient: string;
  code: string;
}

/**
 * Send verification code via email
 */
export async function sendVerificationCode(params: SendVerificationCodeParams): Promise<void> {
  const { recipient, code } = params;

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@oscar-zorg.nl';
  const fromName = process.env.SMTP_FROM_NAME || 'Oscar Zorgcoordinatie';

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: recipient,
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
