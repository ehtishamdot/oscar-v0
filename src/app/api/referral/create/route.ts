import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { encrypt } from '@/lib/services/encryption';
import { generateInviteToken, getReferralExpiry, getInviteExpiry } from '@/lib/services/referral';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';
import { sendReferralInviteEmail } from './email';

const CreateReferralSchema = z.object({
  patientId: z.string().min(1),
  patientInitials: z.string().min(2).max(10),
  patientCity: z.string().min(1),
  pathways: z.array(z.string()).min(1),
  urgency: z.enum(['normal', 'urgent']).default('normal'),
  notes: z.string().optional(),
  createdBy: z.string().min(1),
  intakeData: z.record(z.unknown()),
  providers: z.array(z.object({
    providerId: z.string().min(1),
    providerEmail: z.string().email(),
    providerName: z.string().min(1),
    providerType: z.enum(['fysio', 'ergo', 'diet', 'other']),
  })).min(1).max(5),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = CreateReferralSchema.parse(body);

    const db = getFirestoreAdmin();
    const batch = db.batch();

    // 1. Encrypt patient data
    const encryptionResult = await encrypt(JSON.stringify(data.intakeData));

    // 2. Store encrypted data
    const encryptedDataRef = db.collection('encrypted_referral_data').doc();
    batch.set(encryptedDataRef, {
      encryptedPayload: encryptionResult.ciphertext,
      encryptedDataKey: encryptionResult.encryptedDataKey,
      iv: encryptionResult.iv,
      authTag: encryptionResult.authTag,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 3. Create referral document
    const referralRef = db.collection('referrals').doc();
    const expiresAt = getReferralExpiry(data.urgency);

    batch.set(referralRef, {
      patientId: data.patientId,
      patientInitials: data.patientInitials,
      patientCity: data.patientCity,
      pathways: data.pathways,
      urgency: data.urgency,
      notes: data.notes || null,
      status: 'open',
      acceptedBy: null,
      acceptedAt: null,
      createdBy: data.createdBy,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
      encryptedDataId: encryptedDataRef.id,
      inviteCount: data.providers.length,
    });

    // 4. Create invite for each provider
    const invites: {
      id: string;
      token: string;
      provider: typeof data.providers[0];
    }[] = [];

    for (const provider of data.providers) {
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

    // 5. Commit all documents
    await batch.commit();

    // 6. Send emails to all providers
    const baseUrl = process.env.PROVIDER_PORTAL_BASE_URL?.replace('/provider/access', '') ||
                    'https://oscar-app-482297690628.europe-west1.run.app';

    const emailPromises = invites.map(invite =>
      sendReferralInviteEmail({
        to: invite.provider.providerEmail,
        providerName: invite.provider.providerName,
        patientInitials: data.patientInitials,
        patientCity: data.patientCity,
        pathways: data.pathways,
        urgency: data.urgency,
        viewUrl: `${baseUrl}/referral/view?token=${invite.token}`,
        statusBadgeUrl: `${baseUrl}/api/referral/status/${referralRef.id}/badge`,
        expiresAt: expiresAt,
      })
    );

    await Promise.all(emailPromises);

    // 7. Audit log
    await createAuditLog({
      actorType: 'system',
      actorId: data.createdBy,
      action: 'REFERRAL_CREATED',
      resource: 'referral',
      resourceId: referralRef.id,
      details: {
        patientId: data.patientId,
        pathways: data.pathways,
        urgency: data.urgency,
        inviteCount: data.providers.length,
        providerIds: data.providers.map(p => p.providerId),
      },
      outcome: 'success',
    });

    return NextResponse.json({
      success: true,
      referralId: referralRef.id,
      invitesSent: invites.length,
    });

  } catch (error) {
    console.error('Error creating referral:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
