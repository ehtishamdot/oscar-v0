import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { requireAdminAuth, unauthorizedResponse } from '@/lib/services/admin-auth';

export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const db = getFirestoreAdmin();

    // Date calculations
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Get all partners
    const partnersSnapshot = await db.collection('partners').get();
    const totalPartners = partnersSnapshot.size;
    const activePartners = partnersSnapshot.docs.filter(d => d.data().isActive !== false).length;

    // Get referrals for this month and last month
    const allReferralsSnapshot = await db.collection('referrals')
      .orderBy('createdAt', 'desc')
      .get();

    const referrals = allReferralsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      acceptedAt: doc.data().acceptedAt?.toDate(),
    }));

    const thisMonthReferrals = referrals.filter(r => r.createdAt >= startOfMonth);
    const lastMonthReferrals = referrals.filter(r =>
      r.createdAt >= startOfLastMonth && r.createdAt <= endOfLastMonth
    );

    const totalCasesThisMonth = thisMonthReferrals.length;
    const totalCasesLastMonth = lastMonthReferrals.length;

    // Calculate acceptance rate
    const acceptedThisMonth = thisMonthReferrals.filter(r => r.status === 'accepted').length;
    const acceptanceRate = totalCasesThisMonth > 0
      ? Math.round((acceptedThisMonth / totalCasesThisMonth) * 100)
      : 0;

    // Get billable cases for revenue calculation
    const billableCasesSnapshot = await db.collection('billable_cases').get();
    const billableCases = billableCasesSnapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));

    const revenueThisMonth = billableCases
      .filter(c => c.createdAt >= startOfMonth)
      .reduce((sum, c) => sum + (c.rate || 0), 0);

    const revenueLastMonth = billableCases
      .filter(c => c.createdAt >= startOfLastMonth && c.createdAt <= endOfLastMonth)
      .reduce((sum, c) => sum + (c.rate || 0), 0);

    // Get pending invoices
    const invoicesSnapshot = await db.collection('invoices')
      .where('status', 'in', ['draft', 'sent'])
      .get();
    const pendingInvoices = invoicesSnapshot.size;

    // Calculate average response time (for accepted referrals)
    const acceptedReferrals = thisMonthReferrals.filter(r => r.status === 'accepted' && r.acceptedAt);
    let avgResponseTime = '- ';
    if (acceptedReferrals.length > 0) {
      const totalResponseMs = acceptedReferrals.reduce((sum, r) => {
        return sum + (r.acceptedAt.getTime() - r.createdAt.getTime());
      }, 0);
      const avgMs = totalResponseMs / acceptedReferrals.length;
      const avgMins = Math.round(avgMs / 60000);
      const hours = Math.floor(avgMins / 60);
      const mins = avgMins % 60;
      avgResponseTime = hours > 0 ? `${hours}.${mins} uur` : `${mins} min`;
    }

    // Cases by pathway
    const casesByPathway: Record<string, number> = {
      fysio: 0,
      ergo: 0,
      diet: 0,
      smoking: 0,
    };
    thisMonthReferrals.forEach(r => {
      const pathway = r.pathways?.[0];
      if (pathway && casesByPathway.hasOwnProperty(pathway)) {
        casesByPathway[pathway]++;
      }
    });

    // Recent activity (from audit logs or referrals)
    const recentReferrals = referrals.slice(0, 5);
    const recentActivity = recentReferrals.map(r => {
      let type = 'case';
      let description = '';

      if (r.status === 'accepted') {
        description = `Case ${r.patientInitials} geaccepteerd in ${r.patientCity}`;
      } else if (r.status === 'open') {
        description = `Nieuwe verwijzing voor ${r.patientInitials} in ${r.patientCity}`;
      } else {
        description = `Verwijzing ${r.patientInitials} verlopen`;
      }

      const timeAgo = getTimeAgo(r.createdAt);

      return { type, description, time: timeAgo };
    });

    const stats = {
      totalPartners,
      activePartners,
      totalCasesThisMonth,
      totalCasesLastMonth,
      revenueThisMonth,
      revenueLastMonth,
      pendingInvoices,
      acceptanceRate,
      avgResponseTime,
      casesByPathway,
      recentActivity,
    };

    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 60) return `${diffMins} min geleden`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} uur geleden`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} dagen geleden`;
}
