import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | null = null;
let adminFirestore: Firestore | null = null;

/**
 * Initialize Firebase Admin SDK
 * Uses Application Default Credentials in production (Cloud Run / Firebase App Hosting)
 * Uses service account key in development
 */
export function initializeFirebaseAdmin(): App {
  if (adminApp) return adminApp;

  if (getApps().length > 0) {
    adminApp = getApps()[0];
    return adminApp;
  }

  // Check for service account key (development)
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      console.error('Failed to parse service account key:', error);
      // Fall back to Application Default Credentials
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    }
  } else {
    // Use Application Default Credentials (production)
    adminApp = initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  return adminApp;
}

/**
 * Get Firestore Admin instance
 */
export function getFirestoreAdmin(): Firestore {
  if (adminFirestore) return adminFirestore;

  const app = initializeFirebaseAdmin();
  adminFirestore = getFirestore(app);

  return adminFirestore;
}
