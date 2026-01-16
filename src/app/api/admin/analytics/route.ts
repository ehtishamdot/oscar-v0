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
    const { searchParams } = new URL(request.url);
    const periodParam = searchParams.get('period') || '6m';

    // Calculate date ranges based on period
    const now = new Date();
    let periodMonths = 6;
    switch (periodParam) {
      case '1m': periodMonths = 1; break;
      case '3m': periodMonths = 3; break;
      case '6m': periodMonths = 6; break;
      case '1y': periodMonths = 12; break;
    }

    const periodStart = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1);
    const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (periodMonths * 2), 1);

    // Fetch all referrals
    const referralsSnapshot = await db.collection('referrals').get();
    const referrals = referralsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      acceptedAt: doc.data().acceptedAt?.toDate(),
    }));

    // Filter referrals by period
    const currentPeriodReferrals = referrals.filter(r => r.createdAt >= periodStart);
    const previousPeriodReferrals = referrals.filter(r =>
      r.createdAt >= previousPeriodStart && r.createdAt < periodStart
    );

    // Calculate overview stats
    const totalCases = currentPeriodReferrals.length;
    const previousTotalCases = previousPeriodReferrals.length;
    const casesGrowth = previousTotalCases > 0
      ? Math.round(((totalCases - previousTotalCases) / previousTotalCases) * 100)
      : 0;

    const acceptedCurrent = currentPeriodReferrals.filter(r => r.status === 'accepted').length;
    const acceptanceRate = totalCases > 0 ? Math.round((acceptedCurrent / totalCases) * 100) : 0;

    const acceptedPrevious = previousPeriodReferrals.filter(r => r.status === 'accepted').length;
    const previousAcceptanceRate = previousTotalCases > 0
      ? Math.round((acceptedPrevious / previousTotalCases) * 100)
      : 0;
    const acceptanceGrowth = previousAcceptanceRate > 0
      ? Math.round(((acceptanceRate - previousAcceptanceRate) / previousAcceptanceRate) * 100)
      : 0;

    // Calculate average response time
    const acceptedWithTime = currentPeriodReferrals.filter(r => r.status === 'accepted' && r.acceptedAt && r.createdAt);
    let avgResponseTime = 0;
    if (acceptedWithTime.length > 0) {
      const totalMs = acceptedWithTime.reduce((sum, r) => {
        return sum + (r.acceptedAt.getTime() - r.createdAt.getTime());
      }, 0);
      avgResponseTime = Math.round(totalMs / acceptedWithTime.length / 60000); // minutes
    }

    // Get providers count
    const providersSnapshot = await db.collection('providers').get();
    const activeProviders = providersSnapshot.size;

    // Cases by month
    const casesByMonth: { month: string; cases: number }[] = [];
    const monthNames = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
    for (let i = periodMonths - 1; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthCases = referrals.filter(r =>
        r.createdAt >= monthDate && r.createdAt <= monthEnd
      ).length;
      casesByMonth.push({
        month: monthNames[monthDate.getMonth()],
        cases: monthCases,
      });
    }

    // Cases by pathway
    const pathwayCounts: Record<string, number> = { fysio: 0, ergo: 0, diet: 0, smoking: 0 };
    const pathwayLabels: Record<string, string> = {
      fysio: 'Fysiotherapie',
      ergo: 'Ergotherapie',
      diet: 'Diëtetiek',
      smoking: 'Stoppen met Roken',
    };
    currentPeriodReferrals.forEach(r => {
      const pathway = r.pathways?.[0];
      if (pathway && pathwayCounts.hasOwnProperty(pathway)) {
        pathwayCounts[pathway]++;
      }
    });
    const totalPathwayCases = Object.values(pathwayCounts).reduce((a, b) => a + b, 0);
    const casesByPathway = Object.entries(pathwayCounts).map(([key, count]) => ({
      pathway: pathwayLabels[key] || key,
      count,
      percentage: totalPathwayCases > 0 ? Math.round((count / totalPathwayCases) * 100) : 0,
    }));

    // Cases by city
    const cityCounts: Record<string, number> = {};
    currentPeriodReferrals.forEach(r => {
      if (r.patientCity) {
        cityCounts[r.patientCity] = (cityCounts[r.patientCity] || 0) + 1;
      }
    });
    const casesByCity = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city, count]) => ({ city, count }));

    // Response time by pathway
    const responseTimeByPathway = Object.entries(pathwayLabels).map(([key, label]) => {
      const pathwayReferrals = currentPeriodReferrals.filter(r =>
        r.pathways?.[0] === key && r.status === 'accepted' && r.acceptedAt && r.createdAt
      );
      let avgMinutes = 0;
      if (pathwayReferrals.length > 0) {
        const totalMs = pathwayReferrals.reduce((sum, r) => {
          return sum + (r.acceptedAt.getTime() - r.createdAt.getTime());
        }, 0);
        avgMinutes = Math.round(totalMs / pathwayReferrals.length / 60000);
      }
      return { pathway: label, avgMinutes };
    });

    // Top partners (by billable cases)
    const billableCasesSnapshot = await db.collection('billable_cases')
      .where('createdAt', '>=', periodStart)
      .get();

    const partnerStats: Record<string, { cases: number; revenue: number }> = {};
    billableCasesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (!partnerStats[data.partnerId]) {
        partnerStats[data.partnerId] = { cases: 0, revenue: 0 };
      }
      partnerStats[data.partnerId].cases++;
      partnerStats[data.partnerId].revenue += data.rate || 0;
    });

    // Get partner names
    const partnersSnapshot = await db.collection('partners').get();
    const partnerNames: Record<string, string> = {};
    partnersSnapshot.docs.forEach(doc => {
      const data = doc.data();
      partnerNames[doc.id] = data.companyName || data.name || 'Onbekend';
    });

    const topPartners = Object.entries(partnerStats)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([partnerId, stats]) => ({
        name: partnerNames[partnerId] || 'Onbekend',
        cases: stats.cases,
        revenue: stats.revenue,
      }));

    // Top providers (by accepted cases)
    const providerStats: Record<string, { name: string; cases: number; offered: number }> = {};
    const invitesSnapshot = await db.collection('referral_invites').get();

    invitesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const createdAt = data.createdAt?.toDate();
      if (createdAt && createdAt >= periodStart) {
        if (!providerStats[data.providerId]) {
          providerStats[data.providerId] = {
            name: data.providerName || 'Onbekend',
            cases: 0,
            offered: 0,
          };
        }
        providerStats[data.providerId].offered++;
        if (data.status === 'accepted') {
          providerStats[data.providerId].cases++;
        }
      }
    });

    const topProviders = Object.values(providerStats)
      .filter(p => p.offered > 0)
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 4)
      .map(p => ({
        name: p.name,
        cases: p.cases,
        acceptanceRate: p.offered > 0 ? Math.round((p.cases / p.offered) * 100) : 0,
      }));

    const analytics = {
      overview: {
        totalCases,
        casesGrowth,
        acceptanceRate,
        acceptanceGrowth,
        avgResponseTime,
        responseTimeChange: 0, // Would need historical data to calculate
        activeProviders,
        providersGrowth: 0, // Would need historical data
      },
      casesByMonth,
      casesByPathway,
      casesByCity,
      responseTimeByPathway,
      topPartners,
      topProviders,
    };

    return NextResponse.json({ success: true, analytics });

  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
