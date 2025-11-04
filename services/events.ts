import { getFirebaseApp } from '@/lib/firebase';
import { type Event } from '@/types/event';
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

const COLLECTION = 'events';

export async function listEvents(): Promise<Event[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  try {
    // Order by date descending (most recent first)
    const q = query(collection(db, COLLECTION), orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Event[];
  } catch (err) {
    console.warn('[events] ordered query failed, falling back', err);
    const snap = await getDocs(collection(db, COLLECTION));
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Event[];
  }
}

export async function createEvent(
  input: Omit<Event, 'id' | 'createdAt'>
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const col = collection(db, COLLECTION);
  // Remove undefined fields to satisfy Firestore
  const payload = Object.fromEntries(
    Object.entries(input).filter(([, v]) => v !== undefined)
  );
  const docRef = await addDoc(col, {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateEvent(
  id: string,
  patch: Partial<Omit<Event, 'id'>>
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const sanitized = Object.fromEntries(
    Object.entries(patch).filter(([, v]) => v !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, id), sanitized);
}

export async function deleteEvent(id: string) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function uploadEventImage(file: File, pathPrefix = 'events') {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  const res = await uploadBytes(fileRef, file);
  return await getDownloadURL(res.ref);
}

