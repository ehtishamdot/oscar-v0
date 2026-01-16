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

export interface ProviderNotificationParams {
  to: string;
  accessUrl: string;
  patientInitials: string;
  pathways: string[];
}

const pathwayNames: Record<string, string> = {
  fysio: 'Fysiotherapie',
  ergo: 'Ergotherapie',
  diet: 'Voedingsbegeleiding',
  smoking: 'Stoppen met Roken',
  gli: 'GLI Programma',
};

/**
 * Send provider notification email
 * IMPORTANT: Email contains NO patient data, only access link
 * This complies with NEN 7510 - email is for notification only
 */
export async function sendProviderNotification(params: ProviderNotificationParams): Promise<void> {
  const { to, accessUrl, patientInitials, pathways } = params;

  const pathwayList = pathways
    .map(p => pathwayNames[p] || p)
    .join(', ');

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@oscar-zorg.nl';
  const fromName = process.env.SMTP_FROM_NAME || 'Oscar Zorgcoordinatie';

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: to,
    subject: 'Oscar - Nieuwe intake beschikbaar',
    text: `
Er staat een nieuwe patient intake klaar voor u.

Patient: ${patientInitials}
Zorgpaden: ${pathwayList}

Klik op de onderstaande link om de intake te bekijken.
Na het klikken ontvangt u een verificatiecode.

${accessUrl}

Deze link is 24 uur geldig en kan slechts eenmaal worden gebruikt.

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
          <h2 style="color: #333; margin-top: 0;">Nieuwe intake beschikbaar</h2>

          <p>Er staat een nieuwe patient intake klaar voor u.</p>

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
          <p style="margin: 0;">Oscar Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Dit is een beveiligd bericht. Deel deze link niet met anderen.</p>
        </div>
      </div>
    `,
  });
}

/**
 * Send patient confirmation email
 */
export async function sendPatientConfirmation(params: {
  to: string;
  patientName: string;
  pathways: string[];
}): Promise<void> {
  const { to, patientName, pathways } = params;

  const pathwayList = pathways
    .map(p => pathwayNames[p] || p)
    .join(', ');

  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || 'noreply@oscar-zorg.nl';
  const fromName = process.env.SMTP_FROM_NAME || 'Oscar Zorgcoordinatie';

  await getTransporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: to,
    subject: 'Oscar - Bevestiging van uw aanmelding',
    text: `
Beste ${patientName},

Bedankt voor het invullen van de intake vragenlijst.

Uw gekozen zorgpaden: ${pathwayList}

Uw gegevens zijn veilig versleuteld en doorgestuurd naar de betreffende zorgverlener(s). U ontvangt binnenkort bericht over de vervolgstappen.

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
          <h2 style="color: #333; margin-top: 0;">Bevestiging van uw aanmelding</h2>

          <p>Beste ${patientName},</p>

          <p>Bedankt voor het invullen van de intake vragenlijst.</p>

          <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4caf50;">
            <p style="margin: 0; color: #2e7d32;"><strong>Uw gekozen zorgpaden:</strong></p>
            <p style="margin: 10px 0 0;">${pathwayList}</p>
          </div>

          <p>Uw gegevens zijn veilig versleuteld en doorgestuurd naar de betreffende zorgverlener(s). U ontvangt binnenkort bericht over de vervolgstappen.</p>
        </div>

        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p style="margin: 0;">Oscar Zorgcoordinatie Platform</p>
          <p style="margin: 5px 0 0;">Heeft u vragen? Neem contact op met uw zorgverlener.</p>
        </div>
      </div>
    `,
  });
}
