import { getFirebaseApp } from '@/lib/firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

export async function isAdmin(uid: string | null): Promise<boolean> {
  if (!uid) {
    return false;
  }
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const ref = doc(db, 'admins', uid);
  const snap = await getDoc(ref);
  return snap.exists();
}
