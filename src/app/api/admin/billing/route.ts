import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { requireAdminAuth, unauthorizedResponse } from '@/lib/services/admin-auth';

// GET - List invoices
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const month = searchParams.get('month'); // format: YYYY-MM

    const db = getFirestoreAdmin();
    let query = db.collection('invoices').orderBy('createdAt', 'desc');

    const invoicesSnapshot = await query.get();

    const invoices = invoicesSnapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
          dueDate: data.dueDate?.toDate?.()?.toISOString() || null,
          sentAt: data.sentAt?.toDate?.()?.toISOString() || null,
          paidAt: data.paidAt?.toDate?.()?.toISOString() || null,
        };
      })
      .filter(inv => {
        if (status && status !== 'all' && inv.status !== status) return false;
        return true;
      });

    // Calculate stats
    const stats = {
      total: invoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
      paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0),
      pending: invoices.filter(inv => inv.status === 'sent').reduce((sum, inv) => sum + (inv.total || 0), 0),
      overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.total || 0), 0),
    };

    return NextResponse.json({ success: true, invoices, stats });

  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST - Generate invoices for a month
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { month, year } = body; // e.g., { month: 1, year: 2026 }

    if (!month || !year) {
      return NextResponse.json(
        { success: false, error: 'Month and year required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    // Get date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get all unbilled cases for this month
    const casesSnapshot = await db.collection('billable_cases')
      .where('billed', '==', false)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    if (casesSnapshot.empty) {
      return NextResponse.json({
        success: true,
        message: 'No unbilled cases for this period',
        invoicesCreated: 0,
      });
    }

    // Group cases by partner
    const casesByPartner: Record<string, typeof casesSnapshot.docs> = {};
    casesSnapshot.docs.forEach(doc => {
      const partnerId = doc.data().partnerId;
      if (!casesByPartner[partnerId]) {
        casesByPartner[partnerId] = [];
      }
      casesByPartner[partnerId].push(doc);
    });

    // Generate invoice number
    const lastInvoiceSnapshot = await db.collection('invoices')
      .orderBy('invoiceNumber', 'desc')
      .limit(1)
      .get();

    let invoiceCounter = 1;
    if (!lastInvoiceSnapshot.empty) {
      const lastNumber = lastInvoiceSnapshot.docs[0].data().invoiceNumber;
      const match = lastNumber.match(/OSC-\d{4}-(\d+)/);
      if (match) {
        invoiceCounter = parseInt(match[1]) + 1;
      }
    }

    const batch = db.batch();
    const createdInvoices: string[] = [];

    // Create invoice for each partner
    for (const [partnerId, cases] of Object.entries(casesByPartner)) {
      // Get partner details
      const partnerDoc = await db.collection('partners').doc(partnerId).get();
      if (!partnerDoc.exists) continue;

      const partnerData = partnerDoc.data()!;

      // Calculate totals
      const caseDetails = cases.map(c => {
        const caseData = c.data();
        return {
          caseId: c.id,
          pathway: caseData.pathway,
          patientInitials: caseData.patientInitials,
          acceptedAt: caseData.acceptedAt?.toDate?.()?.toISOString(),
          rate: caseData.rate,
        };
      });

      const subtotal = caseDetails.reduce((sum, c) => sum + c.rate, 0);
      const vatPercentage = 21;
      const vatAmount = subtotal * (vatPercentage / 100);
      const total = subtotal + vatAmount;

      // Create invoice
      const invoiceNumber = `OSC-${year}-${String(invoiceCounter).padStart(4, '0')}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30); // 30 days payment term

      const invoiceRef = db.collection('invoices').doc();
      batch.set(invoiceRef, {
        invoiceNumber,
        partnerId,
        partnerName: partnerData.companyName || partnerData.name,
        partnerEmail: partnerData.email,
        partnerAddress: partnerData.address || null,
        period: { month, year },
        cases: caseDetails,
        caseCount: cases.length,
        subtotal,
        vatPercentage,
        vatAmount,
        total,
        status: 'draft',
        dueDate,
        createdAt: FieldValue.serverTimestamp(),
      });

      // Mark cases as billed
      cases.forEach(caseDoc => {
        batch.update(caseDoc.ref, {
          billed: true,
          invoiceId: invoiceRef.id,
        });
      });

      createdInvoices.push(invoiceNumber);
      invoiceCounter++;
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      invoicesCreated: createdInvoices.length,
      invoiceNumbers: createdInvoices,
    });

  } catch (error) {
    console.error('Error generating invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoices' },
      { status: 500 }
    );
  }
}

// PUT - Update invoice status
export async function PUT(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID and status required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (status === 'sent') {
      updateData.sentAt = FieldValue.serverTimestamp();
    } else if (status === 'paid') {
      updateData.paidAt = FieldValue.serverTimestamp();
    }

    await db.collection('invoices').doc(id).update(updateData);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}
