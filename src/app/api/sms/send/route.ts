import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/services/sms';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, message, sender } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, message' },
        { status: 400 }
      );
    }

    const result = await sendSMS({ to, message, sender });

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
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
