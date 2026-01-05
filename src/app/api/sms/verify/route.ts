import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/services/sms';

// In-memory store for verification codes (use Redis/database in production)
const verificationCodes = new Map<string, { code: string; expires: number }>();

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phoneNumber, action } = body;

    if (!phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (action === 'send') {
      // Generate a new verification code
      const code = generateCode();
      const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

      // Store the code
      verificationCodes.set(phoneNumber, { code, expires });

      // Send SMS
      const result = await sendVerificationCode(phoneNumber, code);

      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Verification code sent',
        });
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      }
    } else if (action === 'verify') {
      const { code } = body;

      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Verification code is required' },
          { status: 400 }
        );
      }

      const stored = verificationCodes.get(phoneNumber);

      if (!stored) {
        return NextResponse.json(
          { success: false, error: 'No verification code found. Please request a new one.' },
          { status: 400 }
        );
      }

      if (Date.now() > stored.expires) {
        verificationCodes.delete(phoneNumber);
        return NextResponse.json(
          { success: false, error: 'Verification code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      if (stored.code !== code) {
        return NextResponse.json(
          { success: false, error: 'Invalid verification code' },
          { status: 400 }
        );
      }

      // Code is valid, remove it
      verificationCodes.delete(phoneNumber);

      return NextResponse.json({
        success: true,
        message: 'Phone number verified successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "send" or "verify"' },
        { status: 400 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
