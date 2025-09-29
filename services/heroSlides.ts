import { getFirebaseApp } from '@/lib/firebase';
import { type HeroSlide } from '@/types/hero';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION = 'heroSlides';

export async function listHeroSlides(): Promise<HeroSlide[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  try {
    const q = query(collection(db, COLLECTION), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data()),
    })) as HeroSlide[];
  } catch (err) {
    console.warn('[heroSlides] ordered query failed, falling back', err);
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => ({
      id: d.id,
      ...(d.data()),
    })) as HeroSlide[];
  }
}

export async function createHeroSlide(
  input: Omit<HeroSlide, 'id' | 'createdAt'>
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const col = collection(db, COLLECTION);
  // Remove undefined fields to satisfy Firestore
  const payload = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(col, {
    ...(payload),
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateHeroSlide(
  id: string,
  patch: Partial<Omit<HeroSlide, 'id'>>
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const sanitized = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, id), sanitized);
}

export async function deleteHeroSlide(id: string) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function uploadHeroImage(file: File, pathPrefix = 'hero') {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  const res = await uploadBytes(fileRef, file);
  return await getDownloadURL(res.ref);
}
