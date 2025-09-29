import { getFirebaseApp } from '@/lib/firebase';
import { PopularDrink, type DrinkSizePrice } from '@/types/drink';
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
  type FieldValue,
  type UpdateData,
  type WithFieldValue,
  type FirestoreDataConverter,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION = 'popularDrinks';

// Build an update type from PopularDrink without hardcoding keys.
export type PopularDrinkUpdate = UpdateData<PopularDrink> & {
  price?: number | FieldValue;
  sizes?: DrinkSizePrice[] | FieldValue;
};

export type CreatePopularDrinkInput = WithFieldValue<Omit<PopularDrink, 'id'>>;

const popularDrinkConverter: FirestoreDataConverter<PopularDrink> = {
  toFirestore(model: PopularDrink): DocumentData {
    const { id, ...rest } = model as PopularDrink;
    return rest as DocumentData;
  },
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options) as PopularDrink;
    return { id: snapshot.id, ...data } as PopularDrink;
  },
};

export async function listPopularDrinks(): Promise<PopularDrink[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const col = collection(db, COLLECTION).withConverter(popularDrinkConverter);
  const snap = await getDocs(col);
  return snap.docs.map((d) => d.data());
}

export async function createPopularDrink(input: CreatePopularDrinkInput) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const colRef = collection(db, COLLECTION).withConverter(
    popularDrinkConverter
  );
  const doc = await addDoc(colRef, {
    ...(input as WithFieldValue<PopularDrink>),
    createdAt: serverTimestamp(),
  });
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

export async function uploadPopularVideo(
  file: File,
  pathPrefix = 'popular-videos'
) {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  const res = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(res.ref);
  return url;
}

export async function updatePopularDrink(
  id: string,
  patch: PopularDrinkUpdate
) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const refDoc = doc(db, COLLECTION, id).withConverter(popularDrinkConverter);
  await updateDoc(refDoc, patch as UpdateData<PopularDrink>);
}

export async function deletePopularDrink(id: string) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const refDoc = doc(db, COLLECTION, id);
  await deleteDoc(refDoc);
}
