import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

const TerminateSessionSchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined;
  const userAgent = request.headers.get('user-agent') || undefined;

  try {
    const body = await request.json();
    const { sessionId } = TerminateSessionSchema.parse(body);

    const db = getFirestoreAdmin();
    const sessionDoc = await db.collection('provider_sessions').doc(sessionId).get();

    if (!sessionDoc.exists) {
      return NextResponse.json(
        { success: false, error: 'Sessie niet gevonden' },
        { status: 404 }
      );
    }

    const sessionData = sessionDoc.data()!;

    // Already terminated
    if (sessionData.status !== 'active') {
      return NextResponse.json({
        success: true,
        message: 'Sessie was al beëindigd',
      });
    }

    // Terminate the session
    await db.collection('provider_sessions').doc(sessionId).update({
      status: 'terminated',
      terminatedAt: FieldValue.serverTimestamp(),
    });

    // Audit log
    await createAuditLog({
      actorType: 'provider',
      actorId: sessionData.providerId,
      action: 'SESSION_TERMINATED',
      resource: 'provider_session',
      resourceId: sessionId,
      details: {
        messageId: sessionData.messageId,
      },
      outcome: 'success',
      ipAddress,
      userAgent,
    });

    return NextResponse.json({
      success: true,
      message: 'Sessie succesvol beëindigd',
    });

  } catch (error) {
    console.error('Error terminating session:', error);

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
