import { getFirebaseApp } from '@/lib/firebase';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { GameUser, GameSession } from '@/types/auth';

const app = getFirebaseApp();
const db = getFirestore(app);
const USERS_COLLECTION = 'gameUsers';

/**
 * Authenticate or register a user with email and phone number
 * Returns the user's ID if successful
 */
export async function authenticateUser(
  email: string,
  phoneNumber: string
): Promise<GameUser> {
  // Normalize inputs
  const normalizedEmail = email.toLowerCase().trim();
  const normalizedPhone = phoneNumber.replace(/\D/g, '');

  // Check if user exists by email
  const emailQuery = query(
    collection(db, USERS_COLLECTION),
    where('email', '==', normalizedEmail)
  );
  const emailSnapshot = await getDocs(emailQuery);

  if (!emailSnapshot.empty) {
    // User exists - update phone number if different and return
    const userDoc = emailSnapshot.docs[0];
    const userData = userDoc.data() as GameUser;

    // Update phone number and last login
    if (userData.phoneNumber !== normalizedPhone) {
      await setDoc(
        doc(db, USERS_COLLECTION, userDoc.id),
        {
          phoneNumber: normalizedPhone,
          lastLoginAt: Date.now(),
        },
        { merge: true }
      );
      userData.phoneNumber = normalizedPhone;
    } else {
      await setDoc(
        doc(db, USERS_COLLECTION, userDoc.id),
        {
          lastLoginAt: Date.now(),
        },
        { merge: true }
      );
    }

    userData.lastLoginAt = Date.now();
    return userData;
  }

  // Check if phone number is already used by another account
  const phoneQuery = query(
    collection(db, USERS_COLLECTION),
    where('phoneNumber', '==', normalizedPhone)
  );
  const phoneSnapshot = await getDocs(phoneQuery);

  if (!phoneSnapshot.empty) {
    throw new Error('This phone number is already registered with a different email');
  }

  // Create new user
  const newUserId = doc(collection(db, USERS_COLLECTION)).id;
  const today = new Date().toDateString();
  const newUser: GameUser = {
    id: newUserId,
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    createdAt: Date.now(),
    lastLoginAt: Date.now(),
    // Initialize game states
    plinkoPlaysRemaining: 2,
    plinkoLastPlayDate: today,
    minesPlaysRemaining: 2,
    minesLastPlayDate: today,
    // Initialize empty prizes array
    prizes: [],
  };

  await setDoc(doc(db, USERS_COLLECTION, newUserId), newUser);
  return newUser;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<GameUser | null> {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!userDoc.exists()) {
    return null;
  }
  return userDoc.data() as GameUser;
}

/**
 * Save session to localStorage
 */
export function saveSession(session: GameSession): void {
  localStorage.setItem('gameSession', JSON.stringify(session));
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('gameSessionChange'));
}

/**
 * Get session from localStorage
 */
export function getSession(): GameSession | null {
  const sessionStr = localStorage.getItem('gameSession');
  if (!sessionStr) return null;

  try {
    const session = JSON.parse(sessionStr) as GameSession;
    
    // Check if session is still valid (24 hours)
    const sessionAge = Date.now() - session.authenticatedAt;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (sessionAge > maxAge) {
      clearSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
}

/**
 * Clear session from localStorage
 */
export function clearSession(): void {
  localStorage.removeItem('gameSession');
  // Dispatch custom event to notify other components
  window.dispatchEvent(new Event('gameSessionChange'));
}

