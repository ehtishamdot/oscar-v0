import { NextResponse } from 'next/server';
import { getBalance } from '@/lib/services/sms';

export async function GET() {
  try {
    const result = await getBalance();

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
