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
import { MinesPrize } from '@/types/mines';
import { GameUser, UserPrizeEntry } from '@/types/auth';
import { getPrizeExpiryDate } from '@/lib/mines/prizes';

const app = getFirebaseApp();
const USERS_COLLECTION = 'gameUsers';

// Get Firestore instance
const db = getFirestore(app);

export async function saveMinesPrizeToFirebase(
  userId: string,
  phoneNumber: string,
  prize: MinesPrize
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  
  const prizeEntry: UserPrizeEntry = {
    id: `mines_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    prize,
    wonAt: Date.now(),
    redeemedAt: null,
    expiresAt: getPrizeExpiryDate(),
    gameType: 'mines',
  };

  // Add prize to user's prizes array
  await updateDoc(userRef, {
    prizes: arrayUnion(prizeEntry),
  });
  
  // Increment play count
  await incrementMinesPlayCount(userId, true);
}

export async function getUserMinesPrizes(userId: string): Promise<UserPrizeEntry[]> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return [];
  }

  const user = userSnap.data() as GameUser;
  
  // Return all Mines prizes (active, expired, and redeemed)
  return (user.prizes || [])
    .filter(p => p.gameType === 'mines')
    .sort((a, b) => b.wonAt - a.wonAt);
}

export async function getMinesPrizesByPhone(phoneNumber: string): Promise<Array<UserPrizeEntry & { userId: string }>> {
  // Normalize phone number (remove spaces, dashes, etc.)
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  
  const q = query(
    collection(db, USERS_COLLECTION),
    where('phoneNumber', '==', normalizedPhone)
  );

  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    return [];
  }

  const now = Date.now();
  const allPrizes: Array<UserPrizeEntry & { userId: string }> = [];
  
  // Get prizes from all users with this phone number (should only be one)
  snapshot.forEach((doc) => {
    const user = doc.data() as GameUser;
    const activePrizes = (user.prizes || [])
      .filter(p => p.expiresAt > now && p.redeemedAt === null && p.gameType === 'mines')
      .map(p => ({ ...p, userId: user.id }));
    allPrizes.push(...activePrizes);
  });

  return allPrizes.sort((a, b) => b.wonAt - a.wonAt);
}

export async function redeemMinesPrize(userId: string, prizeId: string): Promise<boolean> {
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

export async function incrementMinesPlayCount(
  userId: string,
  isWin: boolean
): Promise<void> {
  const { DAILY_PLAYS_LIMIT } = await import('@/lib/mines/prizes');
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
  if (user.minesLastPlayDate !== today) {
    await updateDoc(userRef, {
      minesPlaysRemaining: DAILY_PLAYS_LIMIT - 1,
      minesLastPlayDate: today,
    });
  } else {
    await updateDoc(userRef, {
      minesPlaysRemaining: Math.max(0, user.minesPlaysRemaining - 1),
    });
  }
}

export async function getRemainingMinesPlays(userId: string): Promise<number> {
  const { DAILY_PLAYS_LIMIT } = await import('@/lib/mines/prizes');
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
  if (user.minesLastPlayDate !== today) {
    return DAILY_PLAYS_LIMIT;
  }

  return user.minesPlaysRemaining;
}

