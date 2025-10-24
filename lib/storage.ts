import { getFirebaseApp } from '@/lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage and return the download URL
 * @param file - The file to upload
 * @param pathPrefix - The storage path prefix (e.g., 'hero', 'popular', 'shop-items')
 * @returns The download URL of the uploaded file
 */
export async function uploadFile(file: File, pathPrefix: string): Promise<string> {
  const app = getFirebaseApp();
  const storage = getStorage(app);
  const fileRef = ref(storage, `${pathPrefix}/${Date.now()}-${file.name}`);
  const result = await uploadBytes(fileRef, file);
  return await getDownloadURL(result.ref);
}
