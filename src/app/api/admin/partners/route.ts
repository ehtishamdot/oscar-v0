import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAdminAuth, unauthorizedResponse } from '@/lib/services/admin-auth';
import { createAuditLog } from '@/lib/services/audit';

const PartnerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  type: z.enum(['fysio_partner', 'ergo_partner', 'diet_partner', 'smoking_partner']),
  companyName: z.string().min(1),
  city: z.string().min(1),
  address: z.object({
    street: z.string(),
    postalCode: z.string(),
  }).optional(),
  kvkNumber: z.string().optional(),
  btwNumber: z.string().optional(),
  iban: z.string().optional(),
  rate: z.number().min(0),
  isActive: z.boolean().default(true),
  billingType: z.enum(['paid', 'free']).default('paid'),
});

// Default rates per partner type
const DEFAULT_RATES: Record<string, number> = {
  fysio_partner: 25,
  ergo_partner: 25,
  diet_partner: 30,
  smoking_partner: 35,
};

// GET - List all partners (both paid coordinators and free providers)
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const db = getFirestoreAdmin();

    // Fetch from partners collection (paid coordinators)
    const partnersSnapshot = await db.collection('partners')
      .orderBy('createdAt', 'desc')
      .get();

    // Fetch from providers collection (free providers who accept patients)
    // No limit - we'll handle pagination on the frontend
    const providersSnapshot = await db.collection('providers')
      .orderBy('createdAt', 'desc')
      .get();

    // Process partners (paid) - get case counts only for paid partners
    const paidPartners = await Promise.all(partnersSnapshot.docs.map(async (doc) => {
      const data = doc.data();

      // Get case count for this partner
      const casesSnapshot = await db.collection('billable_cases')
        .where('partnerId', '==', doc.id)
        .get();

      // Get this month's cases
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthCases = casesSnapshot.docs.filter(caseDoc => {
        const caseData = caseDoc.data();
        return caseData.createdAt?.toDate() >= startOfMonth;
      }).length;

      return {
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        type: data.type || 'fysio_partner',
        companyName: data.companyName || '',
        city: data.city || '',
        rate: data.rate || DEFAULT_RATES[data.type] || 25,
        isActive: data.isActive !== false,
        billingType: data.billingType || 'paid',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        casesThisMonth: thisMonthCases,
        totalCases: casesSnapshot.size,
      };
    }));

    // Process providers (free) - no case counts needed
    const freeProviders = providersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.practiceName || '',
        email: data.email || '',
        phone: data.phone || '',
        type: (data.type === 'fysio' ? 'fysio_partner' : data.type) || 'fysio_partner',
        companyName: data.name || data.practiceName || '',
        city: data.city || data.cityName || '',
        rate: 0, // Free providers don't have a rate
        isActive: data.isActive !== false,
        billingType: 'free' as const,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
        casesThisMonth: 0,
        totalCases: 0,
      };
    });

    // Combine and return - paid partners first, then free providers
    const allPartners = [...paidPartners, ...freeProviders];

    return NextResponse.json({
      success: true,
      partners: allPartners,
      counts: {
        total: allPartners.length,
        paid: paidPartners.length,
        free: freeProviders.length,
      }
    });

  } catch (error) {
    console.error('Error fetching partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch partners' },
      { status: 500 }
    );
  }
}

// POST - Create new partner (paid or free)
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const data = PartnerSchema.parse(body);

    const db = getFirestoreAdmin();

    // Set default rate based on billing type
    if (data.billingType === 'free') {
      data.rate = 0;
    } else if (!data.rate) {
      data.rate = DEFAULT_RATES[data.type] || 25;
    }

    // Determine which collection to use based on billingType
    const collection = data.billingType === 'free' ? 'providers' : 'partners';

    const partnerRef = await db.collection(collection).add({
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      partnerId: partnerRef.id,
    });

  } catch (error) {
    console.error('Error creating partner:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create partner' },
      { status: 500 }
    );
  }
}

// PUT - Update partner (checks both collections)
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Partner ID required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    // Check which collection the document exists in
    const partnerDoc = await db.collection('partners').doc(id).get();
    const providerDoc = await db.collection('providers').doc(id).get();

    const collection = partnerDoc.exists ? 'partners' : (providerDoc.exists ? 'providers' : null);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    await db.collection(collection).doc(id).update({
      ...updateData,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update partner' },
      { status: 500 }
    );
  }
}

// DELETE - Delete partner (soft delete by setting isActive = false, checks both collections)
export async function DELETE(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Partner ID required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    // Check which collection the document exists in
    const partnerDoc = await db.collection('partners').doc(id).get();
    const providerDoc = await db.collection('providers').doc(id).get();

    const collection = partnerDoc.exists ? 'partners' : (providerDoc.exists ? 'providers' : null);

    if (!collection) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    await db.collection(collection).doc(id).update({
      isActive: false,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete partner' },
      { status: 500 }
    );
  }
}
