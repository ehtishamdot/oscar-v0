import { getFirestoreAdmin } from '@/lib/firebase/admin';

// Provider type definitions
export interface Provider {
  practiceId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  postcode: string;
  city: string;
  region: string;
  specializations: string[];
  therapistCount: number;
  type: 'fysio' | 'ergo' | 'diet' | 'smoking' | 'gli';
  isActive: boolean;
}

export interface MatchedProvider {
  providerId: string;
  providerEmail: string;
  providerName: string;
  providerType: 'fysio' | 'ergo' | 'diet' | 'other';
  phone: string;
  city: string;
  distance?: number; // in km if coordinates available
}

// Pathway to provider type mapping
const pathwayToProviderType: Record<string, string> = {
  fysio: 'fysio',
  physio: 'fysio',
  ergo: 'ergo',
  diet: 'diet',
  smoking: 'smoking',
  gli: 'gli',
};

// Normalize Dutch postcode (extract numeric prefix for region matching)
function normalizePostcode(postcode: string): string {
  return postcode.replace(/\s/g, '').toUpperCase();
}

function getPostcodePrefix(postcode: string, digits: number = 4): string {
  const normalized = normalizePostcode(postcode);
  return normalized.substring(0, digits);
}

/**
 * Find providers matching a specific pathway in/near a postcode area
 */
export async function findProvidersByPathway(
  pathway: string,
  patientPostcode: string,
  maxResults: number = 3
): Promise<MatchedProvider[]> {
  const db = getFirestoreAdmin();
  const providerType = pathwayToProviderType[pathway.toLowerCase()] || pathway;
  const normalizedPostcode = normalizePostcode(patientPostcode);

  // Strategy: First try exact postcode area (4 digits), then expand to 3 digits, then 2 digits
  let providers: MatchedProvider[] = [];

  // Try with 4-digit postcode prefix (most specific)
  providers = await queryProvidersByPostcodePrefix(db, providerType, normalizedPostcode, 4, maxResults);

  // If not enough, try 3-digit prefix
  if (providers.length < maxResults) {
    const moreProviders = await queryProvidersByPostcodePrefix(db, providerType, normalizedPostcode, 3, maxResults - providers.length);
    const existingIds = new Set(providers.map(p => p.providerId));
    providers.push(...moreProviders.filter(p => !existingIds.has(p.providerId)));
  }

  // If still not enough, try 2-digit prefix (wider region)
  if (providers.length < maxResults) {
    const moreProviders = await queryProvidersByPostcodePrefix(db, providerType, normalizedPostcode, 2, maxResults - providers.length);
    const existingIds = new Set(providers.map(p => p.providerId));
    providers.push(...moreProviders.filter(p => !existingIds.has(p.providerId)));
  }

  // If still no results, try by region/city name from any provider in that postcode
  if (providers.length === 0) {
    providers = await queryProvidersByType(db, providerType, maxResults);
  }

  return providers.slice(0, maxResults);
}

async function queryProvidersByPostcodePrefix(
  db: FirebaseFirestore.Firestore,
  providerType: string,
  patientPostcode: string,
  prefixLength: number,
  limit: number
): Promise<MatchedProvider[]> {
  const prefix = getPostcodePrefix(patientPostcode, prefixLength);

  // Query providers where postcode starts with prefix
  // Firestore range query for prefix matching
  const endPrefix = prefix.slice(0, -1) + String.fromCharCode(prefix.charCodeAt(prefix.length - 1) + 1);

  const snapshot = await db.collection('providers')
    .where('type', '==', providerType)
    .where('isActive', '==', true)
    .where('postcode', '>=', prefix)
    .where('postcode', '<', endPrefix)
    .limit(limit)
    .get();

  return snapshot.docs
    .filter(doc => {
      const data = doc.data();
      // Must have a valid email
      return data.email && data.email.includes('@');
    })
    .map(doc => {
      const data = doc.data();
      return {
        providerId: doc.id,
        providerEmail: data.email,
        providerName: data.name,
        providerType: mapProviderType(data.type),
        phone: data.phone || '',
        city: data.city || '',
      };
    });
}

async function queryProvidersByType(
  db: FirebaseFirestore.Firestore,
  providerType: string,
  limit: number
): Promise<MatchedProvider[]> {
  // Fallback: get any active provider of this type
  const snapshot = await db.collection('providers')
    .where('type', '==', providerType)
    .where('isActive', '==', true)
    .limit(limit * 2) // Get more to filter
    .get();

  return snapshot.docs
    .filter(doc => {
      const data = doc.data();
      return data.email && data.email.includes('@');
    })
    .slice(0, limit)
    .map(doc => {
      const data = doc.data();
      return {
        providerId: doc.id,
        providerEmail: data.email,
        providerName: data.name,
        providerType: mapProviderType(data.type),
        phone: data.phone || '',
        city: data.city || '',
      };
    });
}

function mapProviderType(type: string): 'fysio' | 'ergo' | 'diet' | 'other' {
  switch (type) {
    case 'fysio':
    case 'physio':
      return 'fysio';
    case 'ergo':
      return 'ergo';
    case 'diet':
      return 'diet';
    default:
      return 'other';
  }
}

/**
 * Find providers for multiple pathways
 * Returns a map of pathway -> matched providers
 */
export async function findProvidersForPathways(
  pathways: string[],
  patientPostcode: string,
  maxProvidersPerPathway: number = 3
): Promise<Map<string, MatchedProvider[]>> {
  const results = new Map<string, MatchedProvider[]>();

  await Promise.all(
    pathways.map(async (pathway) => {
      const providers = await findProvidersByPathway(pathway, patientPostcode, maxProvidersPerPathway);
      results.set(pathway, providers);
    })
  );

  return results;
}

/**
 * Get the single nearest provider for a pathway
 * Used when only one provider is needed
 */
export async function findNearestProvider(
  pathway: string,
  patientPostcode: string
): Promise<MatchedProvider | null> {
  const providers = await findProvidersByPathway(pathway, patientPostcode, 1);
  return providers.length > 0 ? providers[0] : null;
}

/**
 * Get all unique providers for multiple pathways
 * Combines providers across all pathways, removing duplicates
 */
export async function getAllProvidersForReferral(
  pathways: string[],
  patientPostcode: string,
  maxProvidersPerPathway: number = 3
): Promise<MatchedProvider[]> {
  const pathwayProviders = await findProvidersForPathways(pathways, patientPostcode, maxProvidersPerPathway);

  const allProviders: MatchedProvider[] = [];
  const seenIds = new Set<string>();

  for (const providers of pathwayProviders.values()) {
    for (const provider of providers) {
      if (!seenIds.has(provider.providerId)) {
        seenIds.add(provider.providerId);
        allProviders.push(provider);
      }
    }
  }

  return allProviders;
}

/**
 * Get provider by ID
 */
export async function getProviderById(providerId: string): Promise<Provider | null> {
  const db = getFirestoreAdmin();
  const doc = await db.collection('providers').doc(providerId).get();

  if (!doc.exists) {
    return null;
  }

  const data = doc.data()!;
  return {
    practiceId: doc.id,
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    address: data.address || '',
    postcode: data.postcode || '',
    city: data.city || '',
    region: data.region || '',
    specializations: data.specializations || [],
    therapistCount: data.therapistCount || 1,
    type: data.type || 'fysio',
    isActive: data.isActive !== false,
  };
}

/**
 * Check if a city/region has providers for a given pathway
 */
export async function hasProvidersInArea(
  pathway: string,
  postcode: string
): Promise<boolean> {
  const providers = await findProvidersByPathway(pathway, postcode, 1);
  return providers.length > 0;
}
