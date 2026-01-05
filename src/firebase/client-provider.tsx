'use client';
import { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from '.';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const firebase = useMemo(() => initializeFirebase(), []);

  // If Firebase is not configured, just render children without provider
  if (!firebase.isConfigured) {
    return <>{children}</>;
  }

  return (
    <FirebaseProvider
      firebaseApp={firebase.app!}
      auth={firebase.auth!}
      firestore={firebase.firestore!}
    >
      {children}
    </FirebaseProvider>
  );
}
