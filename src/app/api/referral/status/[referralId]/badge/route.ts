import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';

/**
 * Dynamic status badge for referral emails
 * Returns an SVG image showing current status (Open/Accepted)
 * This allows emails to show "live" status when opened
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ referralId: string }> }
) {
  try {
    const { referralId } = await params;
    const db = getFirestoreAdmin();

    // Get referral status
    const referralDoc = await db.collection('referrals').doc(referralId).get();

    let status: 'open' | 'accepted' | 'expired' | 'unknown' = 'unknown';
    let acceptedByName: string | null = null;

    if (referralDoc.exists) {
      const data = referralDoc.data()!;
      status = data.status;

      // If accepted, try to get the provider name
      if (status === 'accepted' && data.acceptedBy) {
        const inviteSnapshot = await db.collection('referral_invites')
          .where('referralId', '==', referralId)
          .where('providerId', '==', data.acceptedBy)
          .limit(1)
          .get();

        if (!inviteSnapshot.empty) {
          acceptedByName = inviteSnapshot.docs[0].data().providerName;
        }
      }
    }

    // Generate SVG based on status
    const svg = generateStatusBadge(status, acceptedByName);

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error generating status badge:', error);

    // Return error badge
    const errorSvg = generateStatusBadge('unknown', null);
    return new NextResponse(errorSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}

function generateStatusBadge(status: string, acceptedByName: string | null): string {
  let bgColor: string;
  let textColor: string;
  let statusText: string;
  let icon: string;
  let width: number;

  switch (status) {
    case 'open':
      bgColor = '#059669'; // green
      textColor = '#ffffff';
      statusText = 'BESCHIKBAAR';
      icon = '✓';
      width = 140;
      break;
    case 'accepted':
      bgColor = '#dc2626'; // red
      textColor = '#ffffff';
      statusText = acceptedByName ? `BEZET` : 'BEZET';
      icon = '✗';
      width = 100;
      break;
    case 'expired':
      bgColor = '#6b7280'; // gray
      textColor = '#ffffff';
      statusText = 'VERLOPEN';
      icon = '⏱';
      width = 110;
      break;
    default:
      bgColor = '#9ca3af'; // light gray
      textColor = '#ffffff';
      statusText = 'ONBEKEND';
      icon = '?';
      width = 110;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="32">
  <rect width="${width}" height="32" rx="6" fill="${bgColor}"/>
  <text x="12" y="21" font-family="Arial, sans-serif" font-size="14" fill="${textColor}">${icon}</text>
  <text x="30" y="21" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${textColor}">${statusText}</text>
</svg>
  `.trim();
}
