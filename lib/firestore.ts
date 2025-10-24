import { getFirebaseApp } from '@/lib/firebase';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  Query,
} from 'firebase/firestore';

/**
 * Sanitizes an object by removing undefined values
 * This is required because Firestore doesn't accept undefined values
 * @param obj - Object to sanitize
 * @returns Object with undefined values removed
 */
export function sanitizeFirestoreData<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>;
}

/**
 * Generic function to list all documents from a collection
 * @param collectionName - Name of the Firestore collection
 * @param queryConstraints - Optional query constraints to apply
 * @returns Array of documents with their IDs
 */
export async function listDocuments<T>(
  collectionName: string,
  queryConstraints?: Query
): Promise<(T & { id: string })[]> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const q = queryConstraints ?? collection(db, collectionName);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as (T & { id: string })[];
}

/**
 * Generic function to create a document in a collection
 * @param collectionName - Name of the Firestore collection
 * @param data - Data to create
 * @returns ID of the created document
 */
export async function createDocument<T extends Record<string, unknown>>(
  collectionName: string,
  data: T
): Promise<string> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const col = collection(db, collectionName);
  const sanitized = sanitizeFirestoreData(data);
  const docRef = await addDoc(col, {
    ...sanitized,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

/**
 * Generic function to update a document
 * @param collectionName - Name of the Firestore collection
 * @param id - Document ID
 * @param patch - Partial data to update
 */
export async function updateDocument<T extends Record<string, unknown>>(
  collectionName: string,
  id: string,
  patch: Partial<T>
): Promise<void> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  const sanitized = sanitizeFirestoreData(patch);
  await updateDoc(doc(db, collectionName, id), sanitized);
}

/**
 * Generic function to delete a document
 * @param collectionName - Name of the Firestore collection
 * @param id - Document ID
 */
export async function deleteDocument(
  collectionName: string,
  id: string
): Promise<void> {
  const app = getFirebaseApp();
  const db = getFirestore(app);
  await deleteDoc(doc(db, collectionName, id));
}
