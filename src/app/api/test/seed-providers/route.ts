import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';

// Dummy test providers - use your own email addresses for testing
const testProviders = [
  {
    practiceId: 'test-fysio-001',
    name: 'Test Fysiotherapie Amsterdam',
    email: 'test-fysio@example.com', // Change to your email
    phone: '020-1234567',
    address: 'Teststraat 1',
    postcode: '1017AB',
    city: 'Amsterdam',
    region: 'Amsterdam',
    specializations: ['Algemene fysiotherapie', 'Manuele therapie'],
    therapistCount: 2,
    type: 'fysio',
    billingType: 'free',
    isActive: true,
  },
  {
    practiceId: 'test-fysio-002',
    name: 'Test Fysiotherapie Rotterdam',
    email: 'test-fysio2@example.com', // Change to your email
    phone: '010-2345678',
    address: 'Testlaan 2',
    postcode: '3011AA',
    city: 'Rotterdam',
    region: 'Rotterdam',
    specializations: ['Algemene fysiotherapie'],
    therapistCount: 1,
    type: 'fysio',
    billingType: 'free',
    isActive: true,
  },
  {
    practiceId: 'test-ergo-001',
    name: 'Test Ergotherapie Amsterdam',
    email: 'test-ergo@example.com', // Change to your email
    phone: '020-3456789',
    address: 'Ergoweg 3',
    postcode: '1018CD',
    city: 'Amsterdam',
    region: 'Amsterdam',
    specializations: ['Ergotherapie'],
    therapistCount: 1,
    type: 'ergo',
    billingType: 'free',
    isActive: true,
  },
  {
    practiceId: 'test-diet-001',
    name: 'Test Diëtist Utrecht',
    email: 'test-diet@example.com', // Change to your email
    phone: '030-4567890',
    address: 'Voedingslaan 4',
    postcode: '3511AB',
    city: 'Utrecht',
    region: 'Utrecht',
    specializations: ['Voedingsbegeleiding'],
    therapistCount: 1,
    type: 'diet',
    billingType: 'free',
    isActive: true,
  },
  {
    practiceId: 'test-smoking-001',
    name: 'Test Stoppen met Roken Coach',
    email: 'test-smoking@example.com', // Change to your email
    phone: '070-5678901',
    address: 'Gezondheidsplein 5',
    postcode: '2511AB',
    city: 'Den Haag',
    region: 'Den Haag',
    specializations: ['Stoppen met roken'],
    therapistCount: 1,
    type: 'smoking',
    billingType: 'free',
    isActive: true,
  },
  {
    practiceId: 'test-gli-001',
    name: 'Test GLI Coach Amsterdam',
    email: 'test-gli@example.com', // Change to your email
    phone: '020-6789012',
    address: 'Leefstijlweg 6',
    postcode: '1019EF',
    city: 'Amsterdam',
    region: 'Amsterdam',
    specializations: ['GLI Programma'],
    therapistCount: 1,
    type: 'gli',
    billingType: 'free',
    isActive: true,
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const testEmail = body.email; // Optional: override all test emails with one email

    const db = getFirestoreAdmin();
    const batch = db.batch();

    for (const provider of testProviders) {
      const ref = db.collection('providers').doc(provider.practiceId);
      batch.set(ref, {
        ...provider,
        email: testEmail || provider.email, // Use provided email or default
        createdAt: new Date(),
      });
    }

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Created ${testProviders.length} test providers`,
      providers: testProviders.map(p => ({
        id: p.practiceId,
        name: p.name,
        type: p.type,
        postcode: p.postcode,
        email: testEmail || p.email,
      })),
    });

  } catch (error) {
    console.error('Error seeding test providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to seed test providers' },
      { status: 500 }
    );
  }
}

// GET - List current test providers
export async function GET() {
  try {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection('providers')
      .where('practiceId', '>=', 'test-')
      .where('practiceId', '<', 'test.')
      .get();

    const providers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      count: providers.length,
      providers,
    });

  } catch (error) {
    console.error('Error fetching test providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch test providers' },
      { status: 500 }
    );
  }
}

// DELETE - Remove all test providers
export async function DELETE() {
  try {
    const db = getFirestoreAdmin();
    const snapshot = await db.collection('providers')
      .where('practiceId', '>=', 'test-')
      .where('practiceId', '<', 'test.')
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Deleted ${snapshot.size} test providers`,
    });

  } catch (error) {
    console.error('Error deleting test providers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete test providers' },
      { status: 500 }
    );
  }
}
