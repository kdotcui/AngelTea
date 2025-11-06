import { getFirebaseApp } from '@/lib/firebase';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
} from 'firebase/firestore';
import { Prize, UserPrize, PlinkoGameState } from '@/types/plinko';
import { generatePrizeCode, getPrizeExpiryDate } from '@/lib/plinko/prizes';

const app = getFirebaseApp();
const PRIZES_COLLECTION = 'plinkoPrizes';
const GAME_STATE_COLLECTION = 'plinkoGameState';

// Get Firestore instance
const db = getFirestore(app);

export async function savePrizeToFirebase(
  userId: string,
  phoneNumber: string,
  prize: Prize
): Promise<string> {
  const code = generatePrizeCode(prize.type);
  const userPrize: UserPrize = {
    id: doc(collection(db, PRIZES_COLLECTION)).id,
    userId,
    phoneNumber,
    prize,
    code,
    wonAt: Date.now(),
    redeemedAt: null,
    expiresAt: getPrizeExpiryDate(),
  };

  await setDoc(doc(db, PRIZES_COLLECTION, userPrize.id), userPrize);
  return code;
}

export async function getUserPrizes(userId: string): Promise<UserPrize[]> {
  const q = query(
    collection(db, PRIZES_COLLECTION),
    where('userId', '==', userId),
    where('expiresAt', '>', Date.now()),
    orderBy('expiresAt', 'desc'),
    orderBy('wonAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as UserPrize);
}

export async function getPrizesByPhone(phoneNumber: string): Promise<UserPrize[]> {
  // Normalize phone number (remove spaces, dashes, etc.)
  const normalizedPhone = phoneNumber.replace(/\D/g, '');
  
  const q = query(
    collection(db, PRIZES_COLLECTION),
    where('phoneNumber', '==', normalizedPhone),
    where('expiresAt', '>', Date.now()),
    where('redeemedAt', '==', null),
    orderBy('expiresAt', 'desc'),
    orderBy('wonAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data() as UserPrize);
}

export async function redeemPrize(prizeId: string): Promise<boolean> {
  const prizeRef = doc(db, PRIZES_COLLECTION, prizeId);
  const prizeDoc = await getDoc(prizeRef);

  if (!prizeDoc.exists()) {
    return false;
  }

  const prize = prizeDoc.data() as UserPrize;
  if (prize.redeemedAt !== null) {
    return false; // Already redeemed
  }

  await updateDoc(prizeRef, {
    redeemedAt: Date.now(),
  });

  return true;
}

export async function incrementPlayCount(
  userId: string,
  isWin: boolean
): Promise<void> {
  const today = new Date().toDateString();
  const docRef = doc(db, GAME_STATE_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const state = docSnap.data() as PlinkoGameState;

    // Reset if it's a new day
    if (state.lastPlayDate !== today) {
      await setDoc(docRef, {
        isPlaying: false,
        ballDropping: false,
        prize: null,
        playsRemaining: 2, // 3 plays per day, so after first play = 2 remaining
        lastPlayDate: today,
      });
    } else {
      await updateDoc(docRef, {
        playsRemaining: Math.max(0, state.playsRemaining - 1),
      });
    }
  } else {
    // First time playing
    await setDoc(docRef, {
      isPlaying: false,
      ballDropping: false,
      prize: null,
      playsRemaining: 2, // After first play
      lastPlayDate: today,
    });
  }
}

export async function getRemainingPlays(
  userId: string,
  dailyLimit: number
): Promise<number> {
  const today = new Date().toDateString();
  const docRef = doc(db, GAME_STATE_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return dailyLimit; // First time user
  }

  const state = docSnap.data() as PlinkoGameState;

  // Reset if it's a new day
  if (state.lastPlayDate !== today) {
    return dailyLimit;
  }

  return state.playsRemaining;
}

