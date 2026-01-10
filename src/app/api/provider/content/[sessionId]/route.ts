import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { decrypt } from '@/lib/services/encryption';
import { getRemainingSessionMinutes } from '@/lib/services/session';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const { sessionId } = await params;
    const db = getFirestoreAdmin();

    // 1. Validate session
    const sessionDoc = await db.collection('provider_sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Ongeldige sessie' },
        { status: 401 }
      );
    }

    const sessionData = sessionDoc.data()!;

    // 2. Check session status
    if (sessionData.status !== 'active') {
      return NextResponse.json(
        { success: false, error: 'Sessie is verlopen of beëindigd' },
        { status: 401 }
      );
    }

    // 3. Check session expiry
    const expiresAt = sessionData.expiresAt.toDate();
    if (expiresAt < new Date()) {
      await db.collection('provider_sessions').doc(sessionId).update({
        status: 'expired',
      });

      await createAuditLog({
        actorType: 'system',
        actorId: 'session-service',
        action: 'SESSION_EXPIRED',
        resource: 'provider_session',
        resourceId: sessionId,
        details: {},
        outcome: 'success',
      });

      return NextResponse.json(
        { success: false, error: 'Sessie is verlopen' },
        { status: 401 }
      );
    }

    // 4. Get the encrypted message
    const messageDoc = await db.collection('secure_messages').doc(sessionData.messageId).get();

    if (!messageDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Bericht niet gevonden' },
        { status: 404 }
      );
    }

    const messageData = messageDoc.data()!;

    // 5. Decrypt the payload (server-side only - key never reaches browser)
    const decryptedPayload = await decrypt({
      ciphertext: messageData.encryptedPayload,
      encryptedDataKey: messageData.encryptedDataKey,
      iv: messageData.iv,
      authTag: messageData.authTag,
    });

    const intakeData = JSON.parse(decryptedPayload);

    // 6. Update session activity
    await db.collection('provider_sessions').doc(sessionId).update({
      lastActivityAt: FieldValue.serverTimestamp(),
      contentAccessedAt: FieldValue.serverTimestamp(),
    });

    // 7. Update message status if first access
    if (messageData.status === 'pending') {
      await db.collection('secure_messages').doc(sessionData.messageId).update({
        status: 'accessed',
        accessedAt: FieldValue.serverTimestamp(),
      });
    }

    // 8. Audit log
    await createAuditLog({
      actorType: 'provider',
      actorId: sessionData.providerId,
      action: 'CONTENT_ACCESSED',
      resource: 'patient_data',
      resourceId: sessionData.messageId,
      details: {
        sessionId: sessionId,
        pathways: messageData.pathways,
      },
      outcome: 'success',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      data: {
        patient: intakeData.patient,
        medical: intakeData.medical,
        questionnaireAnswers: intakeData.questionnaireAnswers,
        pathways: messageData.pathways,
        accessedAt: new Date().toISOString(),
      },
      session: {
        expiresAt: expiresAt.toISOString(),
        remainingMinutes: getRemainingSessionMinutes(expiresAt),
      },
    });

  } catch (error) {
    console.error('Error retrieving content:', error);
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden bij het ophalen van de gegevens' },
      { status: 500 }
    );
  }
}
