'use client';

import { findNearestTherapistsFlow, FindPlacesInput } from "@/ai/flows/find-places-flow";

export type Therapist = {
    id: string; // Firestore document ID
    name: string;
    address: string;
    phone?: string;
    lat: number;
    lon: number;
    distance?: number;
};

export async function findNearestTherapists(postcode: string): Promise<Therapist[]> {
    const input: FindPlacesInput = { postcode };
    try {
        const results = await findNearestTherapistsFlow(input);
        return results;
    } catch (error) {
        console.error("Error calling findNearestTherapistsFlow:", error);
        throw new Error('Er is een fout opgetreden bij het vinden van therapeuten.');
    }
}
