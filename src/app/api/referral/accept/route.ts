import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { hashInviteToken } from '@/lib/services/referral';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

const AcceptReferralSchema = z.object({
  inviteToken: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    const { inviteToken } = AcceptReferralSchema.parse(body);

    const tokenHash = hashInviteToken(inviteToken);
    const db = getFirestoreAdmin();

    // 1. Find the invite by token hash
    const invitesSnapshot = await db.collection('referral_invites')
      .where('inviteTokenHash', '==', tokenHash)
      .limit(1)
      .get();

    if (invitesSnapshot.empty) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige of verlopen uitnodiging' },
        { status: 404 }
      );
    }

    const inviteDoc = invitesSnapshot.docs[0];
    const inviteData = inviteDoc.data();

    // 2. Check invite status
    if (inviteData.status === 'accepted') {
      return NextResponse.json(
        { success: false, error: 'U heeft deze aanvraag al geaccepteerd' },
        { status: 400 }
      );
    }

    if (inviteData.status === 'expired') {
      return NextResponse.json(
        { success: false, error: 'Deze uitnodiging is verlopen' },
        { status: 400 }
      );
    }

    // 3. Check invite expiry
    if (inviteData.expiresAt.toDate() < new Date()) {
      await inviteDoc.ref.update({ status: 'expired' });
      return NextResponse.json(
        { success: false, error: 'Deze uitnodiging is verlopen' },
        { status: 400 }
      );
    }

    // 4. Get the referral and check if still open
    const referralRef = db.collection('referrals').doc(inviteData.referralId);
    const referralDoc = await referralRef.get();

    if (!referralDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Verwijzing niet gevonden' },
        { status: 404 }
      );
    }

    const referralData = referralDoc.data()!;

    // 5. Check if already accepted by someone else
    if (referralData.status === 'accepted') {
      // Update this invite to show it's no longer available
      await inviteDoc.ref.update({
        status: 'expired',
        respondedAt: FieldValue.serverTimestamp(),
      });

      await createAuditLog({
        actorType: 'provider',
        actorId: inviteData.providerId,
        action: 'REFERRAL_ACCEPT_FAILED',
        resource: 'referral',
        resourceId: inviteData.referralId,
        details: {
          reason: 'Already accepted by another provider',
          acceptedBy: referralData.acceptedBy,
        },
        outcome: 'failure',
        ipAddress,
        userAgent,
      });

      return NextResponse.json({
        success: false,
        error: 'Deze patiënt is al geaccepteerd door een andere zorgverlener',
        alreadyAccepted: true,
        acceptedAt: referralData.acceptedAt?.toDate?.()?.toISOString() || null,
      }, { status: 409 });
    }

    if (referralData.status !== 'open') {
      return NextResponse.json(
        { success: false, error: 'Deze verwijzing is niet meer beschikbaar' },
        { status: 400 }
      );
    }

    // 6. Use transaction to ensure atomic acceptance (race condition protection)
    const result = await db.runTransaction(async (transaction) => {
      // Re-fetch referral inside transaction
      const freshReferralDoc = await transaction.get(referralRef);
      const freshReferralData = freshReferralDoc.data()!;

      // Double-check status inside transaction
      if (freshReferralData.status !== 'open') {
        return { success: false, reason: 'already_accepted' };
      }

      // Accept the referral
      transaction.update(referralRef, {
        status: 'accepted',
        acceptedBy: inviteData.providerId,
        acceptedAt: FieldValue.serverTimestamp(),
      });

      // Update this invite
      transaction.update(inviteDoc.ref, {
        status: 'accepted',
        respondedAt: FieldValue.serverTimestamp(),
      });

      return { success: true };
    });

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: 'Deze patiënt is al geaccepteerd door een andere zorgverlener',
        alreadyAccepted: true,
      }, { status: 409 });
    }

    // 7. Mark other invites as expired
    const otherInvites = await db.collection('referral_invites')
      .where('referralId', '==', inviteData.referralId)
      .where('status', '==', 'pending')
      .get();

    const updatePromises = otherInvites.docs.map(doc =>
      doc.ref.update({ status: 'expired' })
    );
    await Promise.all(updatePromises);

    // 8. Create billable case for the partner who referred
    // Note: The accepting provider (definitive) is FREE, the partner who referred pays
    if (referralData.createdBy) {
      // Get partner rate
      const partnerDoc = await db.collection('partners').doc(referralData.createdBy).get();
      let rate = 25; // Default rate

      if (partnerDoc.exists) {
        const partnerData = partnerDoc.data()!;
        rate = partnerData.rate || rate;
      }

      // Determine pathway and partner type
      const pathway = referralData.pathways?.[0] || 'fysio';
      const partnerTypeMap: Record<string, string> = {
        fysio: 'fysio_partner',
        ergo: 'ergo_partner',
        diet: 'diet_partner',
        smoking: 'smoking_partner',
      };

      await db.collection('billable_cases').add({
        referralId: inviteData.referralId,
        partnerId: referralData.createdBy,
        partnerType: partnerTypeMap[pathway] || 'fysio_partner',
        pathway: pathway,
        patientInitials: referralData.patientInitials,
        patientCity: referralData.patientCity,
        acceptedAt: FieldValue.serverTimestamp(),
        acceptedBy: inviteData.providerId,
        acceptedByName: inviteData.providerName,
        rate: rate,
        billed: false,
        invoiceId: null,
        createdAt: FieldValue.serverTimestamp(),
      });
    }

    // 9. Audit log
    await createAuditLog({
      actorType: 'provider',
      actorId: inviteData.providerId,
      action: 'REFERRAL_ACCEPTED',
      resource: 'referral',
      resourceId: inviteData.referralId,
      details: {
        providerEmail: inviteData.providerEmail,
        providerName: inviteData.providerName,
      },
      outcome: 'success',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Patiënt succesvol geaccepteerd!',
      referralId: inviteData.referralId,
      encryptedDataId: referralData.encryptedDataId,
    });

  } catch (error) {
    console.error('Error accepting referral:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige aanvraag' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
