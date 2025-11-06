import { getFirebaseApp } from '@/lib/firebase';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
} from 'firebase/firestore';
import { Prize } from '@/types/plinko';
import { GameUser, UserPrizeEntry } from '@/types/auth';
import { getPrizeExpiryDate } from '@/lib/plinko/prizes';

const app = getFirebaseApp();
const USERS_COLLECTION = 'gameUsers';

// Get Firestore instance
const db = getFirestore(app);

export async function savePrizeToFirebase(
  userId: string,
  phoneNumber: string,
  prize: Prize
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  const prizeEntry: UserPrizeEntry = {
    id: `plinko_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    prize,
    wonAt: Date.now(),
    redeemedAt: null,
    expiresAt: getPrizeExpiryDate(),
    gameType: 'plinko',
  };

  // Add prize to user's prizes array
  await updateDoc(userRef, {
    prizes: arrayUnion(prizeEntry),
  });
  
  // Increment play count
  await incrementPlayCount(userId, true);
}

export async function getUserPrizes(userId: string): Promise<UserPrizeEntry[]> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return [];
  }

  const user = userSnap.data() as GameUser;
  
  // Return all Plinko prizes (active, expired, and redeemed)
  return (user.prizes || [])
    .filter(p => p.gameType === 'plinko')
    .sort((a, b) => b.wonAt - a.wonAt);
}

export async function getAllPrizesByPhone(phoneNumber: string): Promise<{
  active: Array<UserPrizeEntry & { userId: string }>,
  redeemed: Array<UserPrizeEntry & { userId: string }>
}> {
  // Normalize phone number (remove spaces, dashes, etc.)
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  
  const q = query(
    collection(db, USERS_COLLECTION),
    where('phoneNumber', '==', normalizedPhone)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return { active: [], redeemed: [] };
  }

  const now = Date.now();
  const activePrizes: Array<UserPrizeEntry & { userId: string }> = [];
  const redeemedPrizes: Array<UserPrizeEntry & { userId: string }> = [];
  
  // Get prizes from all users with this phone number (should only be one)
  snapshot.forEach((doc) => {
    const user = doc.data() as GameUser;
    
    (user.prizes || []).forEach(p => {
      // Show all prizes from both Plinko and Mines
      if (p.redeemedAt !== null) {
        redeemedPrizes.push({ ...p, userId: user.id });
      } else if (p.expiresAt > now) {
        activePrizes.push({ ...p, userId: user.id });
      }
    });
  });

  return {
    active: activePrizes.sort((a, b) => b.wonAt - a.wonAt),
    redeemed: redeemedPrizes.sort((a, b) => b.redeemedAt! - a.redeemedAt!)
  };
}

export async function redeemPrize(userId: string, prizeId: string): Promise<boolean> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return false;
  }

  const user = userSnap.data() as GameUser;
  const prizes = user.prizes || [];
  
  // Find the prize and mark it as redeemed
  const prizeIndex = prizes.findIndex(p => p.id === prizeId);
  if (prizeIndex === -1) {
    return false;
  }

  if (prizes[prizeIndex].redeemedAt !== null) {
    return false; // Already redeemed
  }

  // Update the prize in the array
  prizes[prizeIndex].redeemedAt = Date.now();
  
  await updateDoc(userRef, {
    prizes: prizes,
  });

  return true;
}

export async function incrementPlayCount(
  userId: string,
  isWin: boolean
): Promise<void> {
  const { DAILY_PLAYS_LIMIT } = await import('@/lib/plinko/prizes');
  const today = new Date().toDateString();
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    throw new Error('User not found');
  }

  const user = userSnap.data() as GameUser;

  // Admin users don't lose plays
  if (user.isAdmin) {
    return;
  }

  // Reset if it's a new day
  if (user.plinkoLastPlayDate !== today) {
    await updateDoc(userRef, {
      plinkoPlaysRemaining: DAILY_PLAYS_LIMIT - 1,
      plinkoLastPlayDate: today,
    });
  } else {
    await updateDoc(userRef, {
      plinkoPlaysRemaining: Math.max(0, user.plinkoPlaysRemaining - 1),
    });
  }
}

export async function getRemainingPlays(userId: string): Promise<number> {
  const { DAILY_PLAYS_LIMIT } = await import('@/lib/plinko/prizes');
  const today = new Date().toDateString();
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return DAILY_PLAYS_LIMIT; // Shouldn't happen, but fallback
  }

  const user = userSnap.data() as GameUser;

  // Admin users get unlimited plays
  if (user.isAdmin) {
    return 999;
  }

  // Reset if it's a new day
  if (user.plinkoLastPlayDate !== today) {
    return DAILY_PLAYS_LIMIT;
  }

  return user.plinkoPlaysRemaining;
}

