import { getFirebaseApp } from '@/lib/firebase';
import { PopularDrink } from '@/types/drink';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION = 'popularDrinks';

export async function listPopularDrinks(): Promise<PopularDrink[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as DocumentData),
  })) as PopularDrink[];
}

export async function createPopularDrink(
  input: Omit<PopularDrink, 'id' | 'createdAt'>
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const col = collection(db, COLLECTION);
  const doc = await addDoc(col, { ...input, createdAt: serverTimestamp() });
  return doc.id;
}

export async function uploadPopularImage(file: File, pathPrefix = 'popular') {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  const res = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(res.ref);
  return url;
}

export async function updatePopularDrink(
  id: string,
  patch: Partial<Omit<PopularDrink, 'id'>>
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const refDoc = doc(db, COLLECTION, id);
  await updateDoc(refDoc, patch as DocumentData);
}

export async function deletePopularDrink(id: string) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const refDoc = doc(db, COLLECTION, id);
  await deleteDoc(refDoc);
}
