
import { getFirebaseApp } from '@/lib/firebase';
import { ShopItem } from '@/types/shop';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';

export async function getShopItems(): Promise<ShopItem[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const shopItems = collection(db, 'shopItems');
  const snap = await getDocs(shopItems);
  return snap.docs.map((doc) => doc.data() as ShopItem);
}

export async function createShopItem(item: ShopItem) {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const shopItems = collection(db, 'shopItems');
  const doc = await addDoc(shopItems, item);
  return doc.id;
}


