
import { getFirebaseApp } from '@/lib/firebase';
import { ShopItem } from '@/types/shop';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  type UpdateData,
  type WithFieldValue,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const COLLECTION = 'shopMerchandise';

export type ShopItemUpdate = UpdateData<ShopItem>;
export type CreateShopItemInput = WithFieldValue<Omit<ShopItem, 'id'>>;

export async function getShopItems(): Promise<ShopItem[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const shopItems = collection(db, COLLECTION);
  const snap = await getDocs(shopItems);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShopItem));
}

export async function createShopItem(item: CreateShopItemInput) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const shopItems = collection(db, COLLECTION);
  const docRef = await addDoc(shopItems, {
    ...item,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateShopItem(id: string, patch: ShopItemUpdate) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const itemRef = doc(db, COLLECTION, id);
  await updateDoc(itemRef, patch);
}

export async function deleteShopItem(id: string) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const itemRef = doc(db, COLLECTION, id);
  await deleteDoc(itemRef);
}

export async function uploadShopItemImage(file: File, pathPrefix = 'shop-items') {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  const res = await uploadBytes(fileRef, file);
  const url = await getDownloadURL(res.ref);
  return url;
}

