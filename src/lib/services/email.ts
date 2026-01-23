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

// Pathway display names
const pathwayNames: Record<string, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Voedingsbegeleiding',
  smoking: 'Stoppen met Roken',
  gli: 'GLI Programma',
};

function formatPathwayList(pathways: string[]): string {
  return pathways.map(p => pathwayNames[p] || p).join(', ');
}

function getFromEmail(): string {
  return process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@oscar-zorg.nl';
}

function getFromName(): string {
  return process.env.SMTP_FROM_NAME || 'ZorgRoute Nederland Zorgcoordinatie';
}

// ============================================================================
// Provider Referral Invitation Email
// ============================================================================
export interface ReferralInviteEmailParams {
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

export async function sendReferralInviteEmail(params: ReferralInviteEmailParams): Promise<void> {
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

  const pathwayList = formatPathwayList(pathways);
  const urgencyText = urgency === 'urgent' ? 'Spoed' : 'Normaal';
  const urgencyColor = urgency === 'urgent' ? '#dc2626' : '#059669';
  const urgencyBg = urgency === 'urgent' ? '#fef2f2' : '#ecfdf5';

  const expiresFormatted = expiresAt.toLocaleDateString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  await getTransporter().sendMail({
    from: `"${getFromName()}" <${getFromEmail()}>`,
    to: to,
    subject: `ZorgRoute Nederland - ${urgency === 'urgent' ? '🚨 SPOED: ' : ''}Nieuwe patiënt beschikbaar in ${patientCity}`,
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
ZorgRoute Nederland Zorgcoordinatie
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ZorgRoute Nederland</h1>
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
          <p style="margin: 0;">ZorgRoute Nederland Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Dit is een beveiligd bericht. Deel deze link niet met anderen.</p>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Patient Confirmation Email
// ============================================================================
export interface PatientConfirmationEmailParams {
  to: string;
  patientName: string;
  pathways: string[];
  providerNames?: string[];
}

export async function sendPatientConfirmationEmail(params: PatientConfirmationEmailParams): Promise<void> {
  const { to, patientName, pathways, providerNames } = params;

  const pathwayList = formatPathwayList(pathways);

  const providerSection = providerNames && providerNames.length > 0
    ? `<p style="margin: 10px 0 0;"><strong>Uw zorgverlener(s):</strong> ${providerNames.join(', ')}</p>`
    : '';

  await getTransporter().sendMail({
    from: `"${getFromName()}" <${getFromEmail()}>`,
    to: to,
    subject: 'ZorgRoute Nederland - Bevestiging van uw aanmelding',
    text: `
Beste ${patientName},

Bedankt voor het invullen van de intake vragenlijst.

Uw gekozen zorgpaden: ${pathwayList}
${providerNames && providerNames.length > 0 ? `Uw zorgverlener(s): ${providerNames.join(', ')}` : ''}

Uw gegevens zijn veilig versleuteld en doorgestuurd naar de betreffende zorgverlener(s). U ontvangt binnenkort bericht over de vervolgstappen.

Met vriendelijke groet,
ZorgRoute Nederland Zorgcoordinatie
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ZorgRoute Nederland</h1>
          <p style="margin: 5px 0 0;">Zorgcoordinatie Platform</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Bevestiging van uw aanmelding</h2>

          <p>Beste ${patientName},</p>

          <p>Bedankt voor het invullen van de intake vragenlijst.</p>

          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;"><strong>Uw gekozen zorgpaden:</strong></p>
            <p style="margin: 10px 0 0;">${pathwayList}</p>
            ${providerSection}
          </div>

          <p>Uw gegevens zijn veilig versleuteld en doorgestuurd naar de betreffende zorgverlener(s). U ontvangt binnenkort bericht over de vervolgstappen.</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">ZorgRoute Nederland Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Heeft u vragen? Neem contact op met uw zorgverlener.</p>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Provider Notification Email (for legacy compatibility)
// ============================================================================
export interface ProviderNotificationParams {
  to: string;
  accessUrl: string;
  patientInitials: string;
  pathways: string[];
}

export async function sendProviderNotification(params: ProviderNotificationParams): Promise<void> {
  const { to, accessUrl, patientInitials, pathways } = params;

  const pathwayList = formatPathwayList(pathways);

  await getTransporter().sendMail({
    from: `"${getFromName()}" <${getFromEmail()}>`,
    to: to,
    subject: 'ZorgRoute Nederland - Nieuwe intake beschikbaar',
    text: `
Er staat een nieuwe patiënt intake klaar voor u.

Patient: ${patientInitials}
Zorgpaden: ${pathwayList}

Klik op de onderstaande link om de intake te bekijken.
Na het klikken ontvangt u een verificatiecode.

${accessUrl}

Deze link is 24 uur geldig en kan slechts eenmaal worden gebruikt.

Met vriendelijke groet,
ZorgRoute Nederland Zorgcoordinatie
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ZorgRoute Nederland</h1>
          <p style="margin: 5px 0 0;">Zorgcoordinatie Platform</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <h2 style="color: #333; margin-top: 0;">Nieuwe intake beschikbaar</h2>

          <p>Er staat een nieuwe patiënt intake klaar voor u.</p>

          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientInitials}</p>
            <p style="margin: 5px 0;"><strong>Zorgpaden:</strong> ${pathwayList}</p>
          </div>

          <p>Klik op de onderstaande knop om de intake te bekijken. Na het klikken ontvangt u een verificatiecode.</p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${accessUrl}" style="background: #0066cc; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Intake Bekijken
            </a>
          </div>

          <p style="color: #666; font-size: 14px;">
            <strong>Let op:</strong> Deze link is 24 uur geldig en kan slechts eenmaal worden gebruikt.
          </p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">ZorgRoute Nederland Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Dit is een beveiligd bericht. Deel deze link niet met anderen.</p>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Provider Accepted Notification Email (sent to patient)
// ============================================================================
export interface ProviderAcceptedEmailParams {
  to: string;
  patientName: string;
  providerName: string;
  providerPhone?: string;
  providerEmail?: string;
  pathway: string;
}

export async function sendProviderAcceptedEmail(params: ProviderAcceptedEmailParams): Promise<void> {
  const { to, patientName, providerName, providerPhone, providerEmail, pathway } = params;

  const pathwayName = pathwayNames[pathway] || pathway;

  const contactInfo = [
    providerPhone ? `Telefoon: ${providerPhone}` : '',
    providerEmail ? `E-mail: ${providerEmail}` : '',
  ].filter(Boolean).join('\n');

  await getTransporter().sendMail({
    from: `"${getFromName()}" <${getFromEmail()}>`,
    to: to,
    subject: `ZorgRoute Nederland - Uw zorgverlener voor ${pathwayName} is gevonden`,
    text: `
Beste ${patientName},

Goed nieuws! Een zorgverlener heeft uw aanvraag geaccepteerd.

Zorgpad: ${pathwayName}
Zorgverlener: ${providerName}
${contactInfo}

Uw zorgverlener neemt binnenkort contact met u op om een afspraak te maken.

Met vriendelijke groet,
ZorgRoute Nederland Zorgcoordinatie
    `.trim(),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">ZorgRoute Nederland</h1>
          <p style="margin: 5px 0 0;">Zorgcoordinatie Platform</p>
        </div>

        <div style="padding: 30px; background: #ffffff;">
          <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #2e7d32; font-weight: bold; font-size: 16px;">
              ✅ Zorgverlener gevonden!
            </p>
          </div>

          <p style="color: #333;">Beste ${patientName},</p>

          <p style="color: #333;">Goed nieuws! Een zorgverlener heeft uw aanvraag geaccepteerd.</p>

          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666; width: 120px;">Zorgpad:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${pathwayName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Zorgverlener:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold;">${providerName}</td>
              </tr>
              ${providerPhone ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">Telefoon:</td>
                <td style="padding: 8px 0; color: #333;">${providerPhone}</td>
              </tr>
              ` : ''}
              ${providerEmail ? `
              <tr>
                <td style="padding: 8px 0; color: #666;">E-mail:</td>
                <td style="padding: 8px 0; color: #333;">${providerEmail}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <p style="color: #333;">Uw zorgverlener neemt binnenkort contact met u op om een afspraak te maken.</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">ZorgRoute Nederland Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Heeft u vragen? Neem contact op met uw zorgverlener.</p>
        </div>
      </div>
    `,
  });
}

// ============================================================================
// Generic Email Sending (for custom emails)
// ============================================================================
export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<{ success: boolean; message: string }> {
  const { to, subject, body, html } = params;

  try {
    await getTransporter().sendMail({
      from: `"${getFromName()}" <${getFromEmail()}>`,
      to: to,
      subject: subject,
      text: body,
      html: html || body.replace(/\n/g, '<br>'),
    });

    return { success: true, message: 'E-mail succesvol verzonden!' };
  } catch (error) {
    console.error('SMTP email error:', error);
    return { success: false, message: 'Kon e-mail niet verzenden.' };
  }
}
