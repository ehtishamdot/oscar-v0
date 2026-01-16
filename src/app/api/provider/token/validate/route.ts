import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { hashToken } from '@/lib/services/token';
import { generateVerificationCode, getCodeExpiry, sendVerificationCode } from '@/lib/services/verification';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

const ValidateTokenSchema = z.object({
  token: z.string().min(32),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    const { token } = ValidateTokenSchema.parse(body);
    const deliveryMethod = 'email' as const;

    const tokenHash = hashToken(token);
    const db = getFirestoreAdmin();

    // 1. Look up token
    const tokenDoc = await db.collection('access_tokens').doc(tokenHash).get();

    if (!tokenDoc.exists) {
      await createAuditLog({
        actorType: 'provider',
        actorId: 'unknown',
        action: 'TOKEN_VALIDATED',
        resource: 'access_token',
        resourceId: tokenHash.substring(0, 16) + '...',
        details: { reason: 'Token not found' },
        outcome: 'failure',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { success: false, error: 'Ongeldige of verlopen toegangslink' },
        { status: 401 }
      );
    }

    const tokenData = tokenDoc.data()!;

    // 2. Check token status (active = unused, code_pending = code already generated)
    if (tokenData.status === 'code_pending') {
      return NextResponse.json(
        { success: false, error: 'Er is al een verificatiecode verzonden. Controleer uw e-mail.' },
        { status: 400 }
      );
    }

    if (tokenData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Deze link is al gebruikt of ingetrokken' },
        { status: 401 }
      );
    }

    // 3. Check token expiry
    if (tokenData.expiresAt.toDate() < new Date()) {
      await db.collection('access_tokens').doc(tokenHash).update({
        status: 'expired',
      });

      await createAuditLog({
        actorType: 'system',
        actorId: 'token-validator',
        action: 'TOKEN_EXPIRED',
        resource: 'access_token',
        resourceId: tokenHash,
        details: {},
        outcome: 'success',
      });

      return NextResponse.json(
        { success: false, error: 'Deze link is verlopen' },
        { status: 401 }
      );
    }

    // 4. Get message to retrieve provider contact info
    const messageDoc = await db.collection('secure_messages').doc(tokenData.messageId).get();
    if (!messageDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Bijbehorend bericht niet gevonden' },
        { status: 404 }
      );
    }

    const messageData = messageDoc.data()!;

    // 5. Generate verification code
    const { code, codeHash } = generateVerificationCode();
    const codeExpiresAt = getCodeExpiry();

    // 5a. Mark token as code_pending to prevent duplicate code generation
    await db.collection('access_tokens').doc(tokenHash).update({
      status: 'code_pending',
      codeGeneratedAt: FieldValue.serverTimestamp(),
    });

    const codeRef = db.collection('verification_codes').doc();
    await codeRef.set({
      tokenHash: tokenHash,
      messageId: tokenData.messageId,
      providerId: tokenData.providerId,
      codeHash: codeHash,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: codeExpiresAt,
      attempts: 0,
      deliveryMethod: deliveryMethod,
      deliveryStatus: 'pending',
    });

    // 6. Send verification code
    const recipient = messageData.providerEmail;

    try {
      await sendVerificationCode({
        method: deliveryMethod,
        recipient: recipient,
        code: code,
      });

      // Update code delivery status
      await codeRef.update({
        deliveredAt: FieldValue.serverTimestamp(),
        deliveryStatus: 'sent',
      });
    } catch (deliveryError) {
      await codeRef.update({
        deliveryStatus: 'failed',
      });
      throw deliveryError;
    }

    // 7. Audit logs
    await createAuditLog({
      actorType: 'provider',
      actorId: tokenData.providerId,
      action: 'TOKEN_VALIDATED',
      resource: 'access_token',
      resourceId: tokenHash,
      details: {},
      outcome: 'success',
      ipAddress,
      userAgent,
    });

    await createAuditLog({
      actorType: 'system',
      actorId: 'verification-service',
      action: 'CODE_SENT',
      resource: 'verification_code',
      resourceId: codeRef.id,
      details: {
        method: 'email',
        recipientMasked: `***@${recipient.split('@')[1]}`,
      },
      outcome: 'success',
    });

    return NextResponse.json({
      success: true,
      codeId: codeRef.id,
      expiresAt: codeExpiresAt.toISOString(),
      deliveryMethod: 'email',
      maskedRecipient: `***@${recipient.split('@')[1]}`,
    });

  } catch (error) {
    console.error('Error validating token:', error);

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
