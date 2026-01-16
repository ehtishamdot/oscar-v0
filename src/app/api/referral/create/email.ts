import nodemailer from 'nodemailer';
import { formatPathways, formatUrgency } from '@/lib/services/referral';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'mail.yourdomain.com',
      port: parseInt(process.env.SMTP_PORT || '465', 10),
      secure: process.env.SMTP_SECURE !== 'false',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
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

export async function sendReferralInviteEmail(params: ReferralEmailParams): Promise<void> {
  const {
    to,
    providerName,
    patientInitials,
    patientCity,
    pathways,
    urgency,
    viewUrl,
    statusBadgeUrl,
    expiresAt,
  } = params;

  const pathwayList = formatPathways(pathways);
  const urgencyText = formatUrgency(urgency);
  const urgencyColor = urgency === 'urgent' ? '#dc2626' : '#059669';
  const urgencyBg = urgency === 'urgent' ? '#fef2f2' : '#ecfdf5';

  const expiresFormatted = expiresAt.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@oscar-zorg.nl';
  const fromName = process.env.SMTP_FROM_NAME || 'Oscar Zorgcoordinatie';

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: to,
    subject: `Oscar - ${urgency === 'urgent' ? '🚨 SPOED: ' : ''}Nieuwe patiënt beschikbaar in ${patientCity}`,
    text: `
Beste ${providerName},

Er is een nieuwe patiënt beschikbaar voor ${pathwayList} in ${patientCity}.

Patiënt: ${patientInitials}
Locatie: ${patientCity}
Zorgpad: ${pathwayList}
Prioriteit: ${urgencyText}

Deze aanvraag is ook verstuurd naar andere zorgverleners in uw regio.
De eerste die accepteert, krijgt de patiënt toegewezen.

Klik op de link hieronder om de details te bekijken en te accepteren:
${viewUrl}

Deze uitnodiging verloopt op ${expiresFormatted}.

Met vriendelijke groet,
Oscar Zorgcoordinatie
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Oscar</h1>
          <p style="margin: 5px 0 0;">Zorgcoordinatie Platform</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <div style="background: ${urgencyBg}; border-left: 4px solid ${urgencyColor}; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: ${urgencyColor}; font-weight: bold; font-size: 16px;">
              ${urgency === 'urgent' ? '🚨 SPOED AANVRAAG' : '📋 Nieuwe Aanvraag'}
            </p>
          </div>

          <p style="color: #333;">Beste ${providerName},</p>

          <p style="color: #333;">Er is een nieuwe patiënt beschikbaar voor behandeling in uw regio.</p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Patiënt:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${patientInitials}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Locatie:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${patientCity}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Zorgpad:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${pathwayList}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Prioriteit:</td>
                <td style="padding: 8px 0;">
                  <span style="background: ${urgencyColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                    ${urgencyText}
                  </span>
                </td>
              </tr>
            </table>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚡ Let op:</strong> Deze aanvraag is ook verstuurd naar andere zorgverleners.
              De eerste die accepteert, krijgt de patiënt toegewezen.
            </p>
          </div>

          <!-- Dynamic Status Badge -->
          <div style="text-align: center; margin: 20px 0;">
            <p style="color: #666; font-size: 14px; margin-bottom: 10px;">Huidige status:</p>
            <img src="${statusBadgeUrl}" alt="Status" style="height: 32px;" />
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${viewUrl}" style="background: #0066cc; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              Bekijk Details & Accepteer
            </a>
          </div>

          <p style="color: #666; font-size: 14px; text-align: center;">
            <strong>Verloopt:</strong> ${expiresFormatted}
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">Oscar Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Dit is een beveiligd bericht. Deel deze link niet met anderen.</p>
        </div>
      </div>
    `,
  });
}
