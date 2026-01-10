import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { hashCode, getMaxCodeAttempts } from '@/lib/services/verification';
import { generateSessionToken, getSessionExpiry } from '@/lib/services/session';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Timing-safe comparison of two hash strings
 * Prevents timing attacks by ensuring constant-time comparison
 */
function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'hex');
    const bufB = Buffer.from(b, 'hex');
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

const VerifyCodeSchema = z.object({
  codeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/, 'Code moet 6 cijfers zijn'),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    const { codeId, code } = VerifyCodeSchema.parse(body);

    const db = getFirestoreAdmin();
    const codeRef = db.collection('verification_codes').doc(codeId);
    const codeDoc = await codeRef.get();

    if (!codeDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige verificatie aanvraag' },
        { status: 400 }
      );
    }

    const codeData = codeDoc.data()!;
    const maxAttempts = getMaxCodeAttempts();

    // 1. Check if code is blocked
    if (codeData.status === 'blocked') {
      return NextResponse.json(
        { success: false, error: 'Te veel pogingen. Vraag een nieuwe code aan.' },
        { status: 429 }
      );
    }

    // 2. Check if code is already used
    if (codeData.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Code is al gebruikt of verlopen' },
        { status: 400 }
      );
    }

    // 3. Check expiry
    if (codeData.expiresAt.toDate() < new Date()) {
      await codeRef.update({ status: 'expired' });
      return NextResponse.json(
        { success: false, error: 'Code is verlopen. Vraag een nieuwe aan.' },
        { status: 400 }
      );
    }

    // 4. Check attempt count before incrementing
    if (codeData.attempts >= maxAttempts) {
      await codeRef.update({ status: 'blocked' });

      await createAuditLog({
        actorType: 'provider',
        actorId: codeData.providerId,
        action: 'CODE_BLOCKED',
        resource: 'verification_code',
        resourceId: codeId,
        details: { attempts: codeData.attempts },
        outcome: 'failure',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        { success: false, error: 'Te veel pogingen. Vraag een nieuwe code aan.' },
        { status: 429 }
      );
    }

    // 5. Increment attempt counter
    await codeRef.update({
      attempts: FieldValue.increment(1),
      lastAttemptAt: FieldValue.serverTimestamp(),
    });

    // 6. Verify the code using timing-safe comparison
    const providedCodeHash = hashCode(code);

    if (!timingSafeCompare(providedCodeHash, codeData.codeHash)) {
      const remainingAttempts = maxAttempts - (codeData.attempts + 1);

      await createAuditLog({
        actorType: 'provider',
        actorId: codeData.providerId,
        action: 'CODE_FAILED',
        resource: 'verification_code',
        resourceId: codeId,
        details: { remainingAttempts },
        outcome: 'failure',
        ipAddress,
        userAgent,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Onjuiste code',
          remainingAttempts: remainingAttempts,
        },
        { status: 401 }
      );
    }

    // 7. Code verified - mark as used
    await codeRef.update({
      status: 'verified',
      verifiedAt: FieldValue.serverTimestamp(),
    });

    // 8. Mark token as used
    await db.collection('access_tokens').doc(codeData.tokenHash).update({
      status: 'used',
      usedAt: FieldValue.serverTimestamp(),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    // 9. Create provider session
    const { sessionId, sessionToken } = generateSessionToken();
    const sessionExpiresAt = getSessionExpiry();

    await db.collection('provider_sessions').doc(sessionId).set({
      messageId: codeData.messageId,
      providerId: codeData.providerId,
      sessionToken: sessionToken,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: sessionExpiresAt,
      lastActivityAt: FieldValue.serverTimestamp(),
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    });

    // 10. Audit logs
    await createAuditLog({
      actorType: 'provider',
      actorId: codeData.providerId,
      action: 'CODE_VERIFIED',
      resource: 'verification_code',
      resourceId: codeId,
      details: {},
      outcome: 'success',
      ipAddress,
      userAgent,
    });

    await createAuditLog({
      actorType: 'system',
      actorId: 'session-service',
      action: 'SESSION_CREATED',
      resource: 'provider_session',
      resourceId: sessionId,
      details: {
        providerId: codeData.providerId,
        messageId: codeData.messageId,
      },
      outcome: 'success',
    });

    return NextResponse.json({
      success: true,
      sessionId: sessionId,
      expiresAt: sessionExpiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Error verifying code:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige code format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}
