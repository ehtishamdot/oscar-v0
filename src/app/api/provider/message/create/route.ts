import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { encrypt } from '@/lib/services/encryption';
import { generateAccessToken, getTokenExpiry } from '@/lib/services/token';
import { sendProviderNotification } from '@/lib/services/email';
import { createAuditLog } from '@/lib/services/audit';
import { FieldValue } from 'firebase-admin/firestore';

const CreateMessageSchema = z.object({
  patientId: z.string().min(1),
  providerId: z.string().min(1),
  providerEmail: z.string().email(),
  providerPhone: z.string().min(10).optional(),
  pathways: z.array(z.string()).min(1),
  intakeData: z.object({
    patient: z.object({
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string(),
      gender: z.string().optional(),
      email: z.string().email(),
      phone: z.string(),
      street: z.string().optional(),
      houseNumber: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
    }),
    medical: z.object({
      currentComplaints: z.string(),
      complaintsLocation: z.array(z.string()),
      complaintsDuration: z.string().optional(),
      previousTreatments: z.string().optional(),
      medications: z.string().optional(),
      otherConditions: z.string().optional(),
    }),
    consents: z.object({
      privacy: z.boolean(),
      treatment: z.boolean(),
      dataSharing: z.boolean(),
    }),
    questionnaireAnswers: z.record(z.record(z.unknown())).optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = CreateMessageSchema.parse(body);

    const db = getFirestoreAdmin();
    const batch = db.batch();

    // 1. Encrypt the payload
    const encryptionResult = await encrypt(JSON.stringify(validatedData.intakeData));

    // 2. Create secure message document
    const messageRef = db.collection('secure_messages').doc();
    const expiresAt = getTokenExpiry();

    batch.set(messageRef, {
      patientId: validatedData.patientId,
      providerId: validatedData.providerId,
      providerEmail: validatedData.providerEmail,
      ...(validatedData.providerPhone && { providerPhone: validatedData.providerPhone }),
      encryptedPayload: encryptionResult.ciphertext,
      encryptedDataKey: encryptionResult.encryptedDataKey,
      iv: encryptionResult.iv,
      authTag: encryptionResult.authTag,
      pathways: validatedData.pathways,
      status: 'pending',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
    });

    // 3. Generate access token
    const { token, tokenHash } = generateAccessToken();
    const tokenRef = db.collection('access_tokens').doc(tokenHash);

    batch.set(tokenRef, {
      messageId: messageRef.id,
      providerId: validatedData.providerId,
      tokenHash: tokenHash,
      status: 'active',
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: expiresAt,
    });

    // 4. Commit the batch
    await batch.commit();

    // 5. Send notification email (no sensitive data, just link)
    const baseUrl = process.env.PROVIDER_PORTAL_BASE_URL || 'https://oscar-healthcare.web.app/provider/access';
    const accessUrl = `${baseUrl}?token=${token}`;

    await sendProviderNotification({
      to: validatedData.providerEmail,
      accessUrl: accessUrl,
      patientInitials: `${validatedData.intakeData.patient.firstName[0]}.${validatedData.intakeData.patient.lastName[0]}.`,
      pathways: validatedData.pathways,
    });

    // 6. Audit logs
    await createAuditLog({
      actorType: 'system',
      actorId: 'intake-system',
      action: 'MESSAGE_CREATED',
      resource: 'secure_message',
      resourceId: messageRef.id,
      details: {
        providerId: validatedData.providerId,
        pathways: validatedData.pathways,
        patientId: validatedData.patientId,
      },
      outcome: 'success',
    });

    await createAuditLog({
      actorType: 'system',
      actorId: 'intake-system',
      action: 'TOKEN_GENERATED',
      resource: 'access_token',
      resourceId: tokenHash,
      details: {
        messageId: messageRef.id,
      },
      outcome: 'success',
    });

    await createAuditLog({
      actorType: 'system',
      actorId: 'intake-system',
      action: 'NOTIFICATION_SENT',
      resource: 'secure_message',
      resourceId: messageRef.id,
      details: {
        method: 'email',
        recipientMasked: `***@${validatedData.providerEmail.split('@')[1]}`,
      },
      outcome: 'success',
    });

    return NextResponse.json({
      success: true,
      messageId: messageRef.id,
    });

  } catch (error) {
    console.error('Error creating secure message:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create secure message' },
      { status: 500 }
    );
  }
}
