import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { hashInviteToken } from '@/lib/services/referral';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

const ViewReferralSchema = z.object({
  token: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    const { token } = ViewReferralSchema.parse(body);

    const tokenHash = hashInviteToken(token);
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

    // 2. Check invite expiry
    if (inviteData.expiresAt.toDate() < new Date()) {
      if (inviteData.status !== 'expired') {
        await inviteDoc.ref.update({ status: 'expired' });
      }
      return NextResponse.json(
        { success: false, error: 'Deze uitnodiging is verlopen' },
        { status: 400 }
      );
    }

    // 3. Get the referral details
    const referralDoc = await db.collection('referrals').doc(inviteData.referralId).get();

    if (!referralDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Verwijzing niet gevonden' },
        { status: 404 }
      );
    }

    const referralData = referralDoc.data()!;

    // 4. Mark invite as viewed (if first time)
    if (inviteData.status === 'pending') {
      await inviteDoc.ref.update({
        status: 'viewed',
        viewedAt: FieldValue.serverTimestamp(),
      });
    }

    // 5. Check if already accepted
    const isAccepted = referralData.status === 'accepted';
    const isAcceptedByMe = isAccepted && referralData.acceptedBy === inviteData.providerId;

    // Get accepter info if accepted by someone else
    let acceptedByInfo = null;
    if (isAccepted && !isAcceptedByMe && referralData.acceptedBy) {
      const accepterInvite = await db.collection('referral_invites')
        .where('referralId', '==', inviteData.referralId)
        .where('providerId', '==', referralData.acceptedBy)
        .limit(1)
        .get();

      if (!accepterInvite.empty) {
        const accepterData = accepterInvite.docs[0].data();
        acceptedByInfo = {
          name: accepterData.providerName,
          acceptedAt: referralData.acceptedAt?.toDate?.()?.toISOString() || null,
        };
      }
    }

    // 6. Audit log
    await createAuditLog({
      actorType: 'provider',
      actorId: inviteData.providerId,
      action: 'REFERRAL_VIEWED',
      resource: 'referral',
      resourceId: inviteData.referralId,
      details: {
        providerEmail: inviteData.providerEmail,
        referralStatus: referralData.status,
      },
      outcome: 'success',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      referral: {
        id: referralDoc.id,
        patientInitials: referralData.patientInitials,
        patientCity: referralData.patientCity,
        pathways: referralData.pathways,
        urgency: referralData.urgency,
        notes: referralData.notes,
        status: referralData.status,
        expiresAt: referralData.expiresAt.toDate().toISOString(),
        createdAt: referralData.createdAt?.toDate?.()?.toISOString() || null,
      },
      invite: {
        id: inviteDoc.id,
        providerName: inviteData.providerName,
        status: inviteData.status,
      },
      canAccept: referralData.status === 'open',
      isAcceptedByMe,
      acceptedByInfo,
    });

  } catch (error) {
    console.error('Error viewing referral:', error);

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
