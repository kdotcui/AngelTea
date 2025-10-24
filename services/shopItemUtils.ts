import { getFirebaseApp } from '@/lib/firebase';
import { uploadFile } from '@/lib/storage';
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
} from 'firebase/firestore';
import { CreateShopItemType } from '@/types/shop';

const COLLECTION = 'shopMerchandise';

export type ShopItemUpdate = UpdateData<ShopItem>;

export async function getShopItems(): Promise<ShopItem[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const shopItems = collection(db, COLLECTION);
  const snap = await getDocs(shopItems);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ShopItem));
}

export async function createShopItem(item: CreateShopItemType) {
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
  return uploadFile(file, pathPrefix);
}

