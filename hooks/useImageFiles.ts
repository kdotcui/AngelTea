import { useState } from 'react';

export function useImageFiles(initialImages: string[] = []) {
  const [existingImages, setExistingImages] = useState<string[]>(initialImages);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const addNewImages = (files: File[]) => {
    setNewImageFiles([...newImageFiles, ...files]);
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
  };

  const reset = () => {
    setNewImageFiles([]);
    setExistingImages(initialImages);
  };

  return {
    existingImages,
    newImageFiles,
    addNewImages,
    removeExistingImage,
    removeNewImage,
    reset,
  };
}
