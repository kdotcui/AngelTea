// Firebase client-side initialization
// This avoids SSR issues by only importing analytics in the browser.

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  signOut,
  type User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Importing analytics conditionally to avoid SSR errors
let analytics: import('firebase/analytics').Analytics | undefined;
let signInInFlight: Promise<import('firebase/auth').UserCredential> | null =
  null;

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

export function getAuthClient() {
  const app = getFirebaseApp();
  return getAuth(app);
}

export function getFirestoreDb() {
  const app = getFirebaseApp();
  return getFirestore(app);
}

export async function signInWithGooglePopup() {
  const auth = getAuthClient();
  const provider = new GoogleAuthProvider();
  // Prevent multiple concurrent popups which cause auth/cancelled-popup-request
  if (signInInFlight) return signInInFlight;
  signInInFlight = (async () => {
    try {
      return await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/cancelled-popup-request') {
        // Ignore duplicate call; resolve with current user if available
        const user = auth.currentUser;
        if (user) {
          return { user } as unknown as import('firebase/auth').UserCredential;
        }
      }
      throw err;
    } finally {
      signInInFlight = null;
    }
  })();
  return signInInFlight;
}

export function onAuthChange(callback: (user: User | null) => void) {
  const auth = getAuthClient();
  // Resolve redirect results if present
  if (typeof window !== 'undefined') {
    getRedirectResult(auth).catch(() => undefined);
  }
  return onAuthStateChanged(auth, callback);
}

export async function signOutUser() {
  const auth = getAuthClient();
  await signOut(auth);
}
