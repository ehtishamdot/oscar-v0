import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { encrypt } from '@/lib/services/encryption';
import { generateInviteToken, getReferralExpiry, getInviteExpiry } from '@/lib/services/referral';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';
import { sendReferralInviteEmail, sendPatientConfirmationEmail } from '@/lib/services/email';
import { findProvidersForPathways, MatchedProvider } from '@/lib/services/provider-matching';
import { nanoid } from 'nanoid';

const IntakeSubmissionSchema = z.object({
  // Patient personal info
  patientName: z.string().min(2),
  patientEmail: z.string().email(),
  patientPhone: z.string().optional(),
  patientBirthDate: z.string().optional(),
  patientPostcode: z.string().min(4),
  patientCity: z.string().optional(),

  // Selected pathways
  pathways: z.array(z.enum(['fysio', 'ergo', 'diet', 'smoking', 'gli'])).min(1),

  // Intake answers (pathway-specific questions)
  intakeAnswers: z.record(z.unknown()),

  // Availability
  availability: z.record(z.array(z.string())).optional(),

  // Insurance (optional)
  insurer: z.string().optional(),
  bsn: z.string().optional(),

  // Additional notes
  remarks: z.string().optional(),

  // Urgency
  urgency: z.enum(['normal', 'urgent']).default('normal'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = IntakeSubmissionSchema.parse(body);

    const db = getFirestoreAdmin();

    // Generate patient ID and get initials
    const patientId = nanoid(12);
    const nameParts = data.patientName.trim().split(' ');
    const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('.') + '.';

    // Find providers for each pathway
    const pathwayProviders = await findProvidersForPathways(
      data.pathways,
      data.patientPostcode,
      3 // Max 3 providers per pathway
    );

    // Collect all unique providers
    const allProviders: MatchedProvider[] = [];
    const seenProviderIds = new Set<string>();

    for (const pathway of data.pathways) {
      const providers = pathwayProviders.get(pathway) || [];
      for (const provider of providers) {
        if (!seenProviderIds.has(provider.providerId)) {
          seenProviderIds.add(provider.providerId);
          allProviders.push(provider);
        }
      }
    }

    // If no providers found, return error
    if (allProviders.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Geen zorgverleners gevonden in uw regio. Probeer een andere postcode of neem contact met ons op.',
      }, { status: 400 });
    }

    const batch = db.batch();

    // 1. Prepare intake data for encryption
    const intakeData = {
      patientName: data.patientName,
      patientEmail: data.patientEmail,
      patientPhone: data.patientPhone || '',
      patientBirthDate: data.patientBirthDate || '',
      patientPostcode: data.patientPostcode,
      patientCity: data.patientCity || '',
      intakeAnswers: data.intakeAnswers,
      availability: data.availability || {},
      insurer: data.insurer || '',
      bsn: data.bsn || '',
      remarks: data.remarks || '',
    };

    // 2. Encrypt patient data
    const encryptionResult = await encrypt(JSON.stringify(intakeData));

    // 3. Store encrypted data
    const encryptedDataRef = db.collection('encrypted_referral_data').doc();
    batch.set(encryptedDataRef, {
      encryptedPayload: encryptionResult.ciphertext,
      encryptedDataKey: encryptionResult.encryptedDataKey,
      iv: encryptionResult.iv,
      authTag: encryptionResult.authTag,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Create referral document
    const referralRef = db.collection('referrals').doc();
    const expiresAt = getReferralExpiry(data.urgency);

    batch.set(referralRef, {
      patientId: patientId,
      patientInitials: initials,
      patientCity: data.patientCity || '',
      patientPostcode: data.patientPostcode,
      pathways: data.pathways,
      urgency: data.urgency,
      notes: data.remarks || null,
      status: 'open',
      acceptedBy: null,
      acceptedAt: null,
      createdBy: 'patient_intake',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      encryptedDataId: encryptedDataRef.id,
      inviteCount: allProviders.length,
    });

    // 5. Create invite for each provider
    const invites: {
      id: string;
      token: string;
      provider: MatchedProvider;
    }[] = [];

    for (const provider of allProviders) {
      const { token, tokenHash } = generateInviteToken();
      const inviteRef = db.collection('referral_invites').doc();
      const inviteExpiresAt = getInviteExpiry(data.urgency);

      batch.set(inviteRef, {
        referralId: referralRef.id,
        providerId: provider.providerId,
        providerEmail: provider.providerEmail,
        providerName: provider.providerName,
        providerType: provider.providerType,
        inviteTokenHash: tokenHash,
        status: 'pending',
        viewedAt: null,
        respondedAt: null,
        sentAt: FieldValue.serverTimestamp(),
        expiresAt: inviteExpiresAt,
      });

      invites.push({
        id: inviteRef.id,
        token: token,
        provider: provider,
      });
    }

    // 6. Commit all documents
    await batch.commit();

    // 7. Send emails to all providers
    const baseUrl = process.env.PROVIDER_PORTAL_BASE_URL?.replace('/provider/access', '') ||
                    process.env.NEXT_PUBLIC_BASE_URL ||
                    'https://oscar-app-482297690628.europe-west1.run.app';

    const emailPromises = invites.map(invite =>
      sendReferralInviteEmail({
        to: invite.provider.providerEmail,
        providerName: invite.provider.providerName,
        patientInitials: initials,
        patientCity: data.patientCity || data.patientPostcode,
        pathways: data.pathways,
        urgency: data.urgency,
        viewUrl: `${baseUrl}/referral/view?token=${invite.token}`,
        statusBadgeUrl: `${baseUrl}/api/referral/status/${referralRef.id}/badge`,
        expiresAt: expiresAt,
      }).catch(err => {
        console.error(`Failed to send email to ${invite.provider.providerEmail}:`, err);
        return null;
      })
    );

    // 8. Send confirmation email to patient
    const providerNames = allProviders.map(p => p.providerName);
    emailPromises.push(
      sendPatientConfirmationEmail({
        to: data.patientEmail,
        patientName: data.patientName,
        pathways: data.pathways,
        providerNames: providerNames.slice(0, 3), // Show up to 3 provider names
      }).catch(err => {
        console.error(`Failed to send confirmation email to patient:`, err);
        return null;
      })
    );

    await Promise.all(emailPromises);

    // 9. Audit log
    await createAuditLog({
      actorType: 'patient',
      actorId: patientId,
      action: 'INTAKE_SUBMITTED',
      resource: 'referral',
      resourceId: referralRef.id,
      details: {
        patientPostcode: data.patientPostcode,
        pathways: data.pathways,
        urgency: data.urgency,
        inviteCount: allProviders.length,
        providerIds: allProviders.map(p => p.providerId),
      },
      outcome: 'success',
    });

    return NextResponse.json({
      success: true,
      referralId: referralRef.id,
      invitesSent: invites.length,
      message: `Uw aanvraag is succesvol verzonden naar ${invites.length} zorgverlener(s). U ontvangt een bevestiging per e-mail.`,
    });

  } catch (error) {
    console.error('Error submitting intake:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige gegevens', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Er is iets misgegaan. Probeer het later opnieuw.' },
      { status: 500 }
    );
  }
}
