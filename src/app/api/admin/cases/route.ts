import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { requireAdminAuth, unauthorizedResponse } from '@/lib/services/admin-auth';

// GET - List all cases (referrals)
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const pathway = searchParams.get('pathway');
    const limit = parseInt(searchParams.get('limit') || '50');

    const db = getFirestoreAdmin();

    // Get referrals
    const referralsSnapshot = await db.collection('referrals')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const cases = await Promise.all(referralsSnapshot.docs.map(async (doc) => {
      const data = doc.data();

      // Get partner info (who referred)
      let referredByName = 'Unknown';
      let referredByType = 'unknown';

      // Get referral invites to find who referred and who accepted
      const invitesSnapshot = await db.collection('referral_invites')
        .where('referralId', '==', doc.id)
        .get();

      const acceptedInvite = invitesSnapshot.docs.find(inv => inv.data().status === 'accepted');
      const acceptedByName = acceptedInvite?.data()?.providerName || null;

      // Calculate response time if accepted
      let responseTime = null;
      if (data.acceptedAt && data.createdAt) {
        const created = data.createdAt.toDate();
        const accepted = data.acceptedAt.toDate();
        const diffMs = accepted.getTime() - created.getTime();
        const diffMins = Math.round(diffMs / 60000);
        const hours = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        responseTime = hours > 0 ? `${hours}u ${mins}m` : `${mins}m`;
      }

      return {
        id: doc.id,
        patientInitials: data.patientInitials,
        patientCity: data.patientCity,
        pathways: data.pathways,
        pathway: data.pathways?.[0] || 'unknown',
        status: data.status,
        urgency: data.urgency,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        acceptedAt: data.acceptedAt?.toDate?.()?.toISOString() || null,
        acceptedBy: acceptedByName,
        referredBy: data.createdBy || referredByName,
        referredByType,
        responseTime,
      };
    }));

    // Filter
    const filteredCases = cases.filter(c => {
      if (status && status !== 'all' && c.status !== status) return false;
      if (pathway && pathway !== 'all' && c.pathway !== pathway) return false;
      return true;
    });

    // Stats
    const stats = {
      total: cases.length,
      open: cases.filter(c => c.status === 'open').length,
      accepted: cases.filter(c => c.status === 'accepted').length,
      expired: cases.filter(c => c.status === 'expired').length,
    };

    return NextResponse.json({ success: true, cases: filteredCases, stats });

  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}
