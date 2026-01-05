/**
 * @fileoverview Server action to find nearest physical therapists from local JSON files.
 * This action is designed to be called from the client-side to securely
 * query the therapists data.
 */
// 'use server'; // Disabled for static export

import { z } from 'zod';
import allPostcodes from '@/lib/postcodes.json';
import { orderByDistance, getDistance, isPointWithinRadius } from 'geolib';

// Define the schema for the therapist data structure.
const TherapistSchema = z.object({
  practiceId: z.string(),
  practiceName: z.string(),
  phone: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  address: z.string(),
  houseNumber: z.string().optional(),
  postcode: z.string(),
  cityName: z.string(),
  lat: z.number().optional(),
  lon: z.number().optional(),
  distance: z.number().optional(),
});

// Define the input schema for the server action.
const FindPlacesInputSchema = z.object({
  postcode: z.string().describe('The user postal code, e.g., "1234AB"'),
});

// Export types to be used on the client.
export type Therapist = z.infer<typeof TherapistSchema>;
export type FindPlacesInput = z.infer<typeof FindPlacesInputSchema>;

/**
 * Finds the 5 nearest therapists based on a user's postcode and calculates the distance.
 * This is a Next.js Server Action.
 */
export async function findNearestTherapistsFlow(input: FindPlacesInput): Promise<Therapist[]> {
  const localTherapistsData = (await import('@/lib/physiotherapists.json')).default;
  const validatedInput = FindPlacesInputSchema.parse(input);
  const { postcode } = validatedInput;

  const postcodes = allPostcodes as Record<string, { lat: number; lon: number }>;

  const cleanedPostcode = postcode.replace(/\s/g, '').toUpperCase();
  const userLocation = postcodes[cleanedPostcode];

  if (!userLocation) {
    return [];
  }

  // De-duplicate therapists based on a cleaned version of their address.
  const seenAddresses = new Set<string>();
  const uniqueTherapists = (localTherapistsData as unknown as Therapist[]).filter(therapist => {
    // Normalize the address to handle variations in whitespace or casing.
    const normalizedAddress = therapist.address.trim().toLowerCase();
    if (seenAddresses.has(normalizedAddress)) {
      return false; // This address has been seen, so filter it out.
    } else {
      seenAddresses.add(normalizedAddress);
      return true; // This is the first time we see this address, keep it.
    }
  });

  const therapistsWithCoords = uniqueTherapists
    .map((therapist) => {
      const therapistPostcode = therapist.postcode.replace(/\s/g, '').toUpperCase();
      const therapistLocation = postcodes[therapistPostcode];
      return {
        ...therapist,
        lat: therapistLocation?.lat,
        lon: therapistLocation?.lon,
      };
    })
    .filter(
      (therapist) =>
        therapist.lat !== undefined && therapist.lon !== undefined
    );

  if (therapistsWithCoords.length === 0) {
      return [];
  }

  const userPoint = { lat: userLocation.lat, lon: userLocation.lon };
  
  // --- OPTIMIZATION START ---
  // First, filter therapists to a more manageable list within a given radius (e.g., 20km).
  // This avoids calculating distances for every single therapist in the dataset.
  const searchRadiusInMeters = 20000; // 20km
  
  const therapistsInRadius = therapistsWithCoords.filter(therapist => 
    isPointWithinRadius(
        { latitude: therapist.lat!, longitude: therapist.lon! },
        { latitude: userPoint.lat, longitude: userPoint.lon },
        searchRadiusInMeters
    )
  );
  // --- OPTIMIZATION END ---

  // Now, sort only the therapists within the radius to find the nearest 5.
  const nearestTherapists = orderByDistance(
    userPoint,
    therapistsInRadius // Use the pre-filtered, smaller list
  ).slice(0, 5);


  const therapistsWithDistance = nearestTherapists.map(therapist => {
    const distanceInMeters = getDistance(
      userPoint,
      therapist
    );
    const distanceInKm = Math.round((distanceInMeters / 1000) * 10) / 10;
    return {
      ...therapist,
      distance: distanceInKm,
    };
  });

  return therapistsWithDistance as Therapist[];
}