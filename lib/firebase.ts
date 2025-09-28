// Firebase client-side initialization
// This avoids SSR issues by only importing analytics in the browser.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

// Importing analytics conditionally to avoid SSR errors
let analytics: import('firebase/analytics').Analytics | undefined;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export function getFirebaseApp(): FirebaseApp {
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  return app;
}

export async function initAnalytics() {
  if (typeof window === 'undefined') return undefined;
  const app = getFirebaseApp();
  if (!analytics) {
    const { getAnalytics } = await import('firebase/analytics');
    analytics = getAnalytics(app);
  }
  return analytics;
}
