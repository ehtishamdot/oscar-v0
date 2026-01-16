import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase/admin';
import { requireAdminAuth, unauthorizedResponse } from '@/lib/services/admin-auth';
import physiotherapists from '@/lib/physiotherapists.json';

// Sample partners (coordinators who refer patients)
const samplePartners = [
  {
    companyName: 'FysioPlus Amsterdam',
    name: 'Jan van der Berg',
    email: 'jan@fysioplus-amsterdam.nl',
    phone: '020-1234567',
    type: 'fysio_partner',
    city: 'Amsterdam',
    rate: 25,
    isActive: true,
  },
  {
    companyName: 'ErgoZorg Utrecht',
    name: 'Maria de Vries',
    email: 'maria@ergozorg-utrecht.nl',
    phone: '030-2345678',
    type: 'ergo_partner',
    city: 'Utrecht',
    rate: 25,
    isActive: true,
  },
  {
    companyName: 'DieetPro Rotterdam',
    name: 'Peter Jansen',
    email: 'peter@dieetpro-rotterdam.nl',
    phone: '010-3456789',
    type: 'diet_partner',
    city: 'Rotterdam',
    rate: 30,
    isActive: true,
  },
  {
    companyName: 'StoppenMetRoken.nl',
    name: 'Lisa Bakker',
    email: 'lisa@stoppenmetroken.nl',
    phone: '070-4567890',
    type: 'smoking_partner',
    city: 'Den Haag',
    rate: 35,
    isActive: true,
  },
  {
    companyName: 'FysioPartner Brabant',
    name: 'Kees de Wit',
    email: 'kees@fysiopartner-brabant.nl',
    phone: '040-5678901',
    type: 'fysio_partner',
    city: 'Eindhoven',
    rate: 25,
    isActive: true,
  },
];

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const auth = await requireAdminAuth();
  if (!auth.authenticated) {
    return unauthorizedResponse(auth.error);
  }

  try {
    const db = getFirestoreAdmin();
    const { type, limit = 20000 } = await request.json(); // Default to import all (~11k providers)

    if (type === 'partners') {
      // Import sample partners (paid coordinators)
      const batch = db.batch();
      for (const partner of samplePartners) {
        const ref = db.collection('partners').doc();
        batch.set(ref, {
          ...partner,
          billingType: 'paid', // Coordinators who pay per case
          createdAt: new Date(),
        });
      }
      await batch.commit();

      return NextResponse.json({
        success: true,
        message: `Imported ${samplePartners.length} paid partners (coordinators)`,
        count: samplePartners.length,
      });
    }

    if (type === 'providers') {
      // Import physiotherapists as free providers (limit to avoid huge imports)
      const providersToImport = (physiotherapists as any[]).slice(0, limit);

      let imported = 0;
      const batchSize = 500;

      for (let i = 0; i < providersToImport.length; i += batchSize) {
        const batch = db.batch();
        const chunk = providersToImport.slice(i, i + batchSize);

        for (const p of chunk) {
          const ref = db.collection('providers').doc(p.practiceId);
          batch.set(ref, {
            practiceId: p.practiceId,
            name: p.practiceName,
            phone: p.phone || '',
            email: p.email || '',
            website: p.website || '',
            address: p.address,
            postcode: p.postcode,
            city: p.cityName,
            region: p.regionName,
            therapistCount: p.therapistCount || 1,
            specializations: p.specializations || [],
            hasGeneralPhysio: p.hasGeneralPhysio || false,
            hasManualTherapy: p.hasManualTherapy || false,
            type: 'fysio',
            billingType: 'free', // Providers who accept patients (no fee)
            isActive: true,
            createdAt: new Date(),
          });
          imported++;
        }

        await batch.commit();
      }

      return NextResponse.json({
        success: true,
        message: `Imported ${imported} free providers`,
        count: imported,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid type. Use "partners" or "providers"',
    }, { status: 400 });

  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      error: 'Import failed',
    }, { status: 500 });
  }
}
