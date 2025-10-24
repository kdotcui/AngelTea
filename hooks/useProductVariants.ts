import { useState, useEffect } from 'react';
import { ProductVariant } from '@/types/shop';
import { generateSKU } from '@/lib/sku';

export function useProductVariants(productName: string, initialVariants: ProductVariant[] = []) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants);

  // Update all variant SKUs when product name changes
  useEffect(() => {
    if (variants.length > 0 && productName) {
      const updatedVariants = variants.map(v => ({
        ...v,
        sku: generateSKU(productName, v.size, v.color)
      }));
      setVariants(updatedVariants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productName]);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      sku: generateSKU(productName),
      stock: 0,
      size: '',
      color: ''
    };
    setVariants([...variants, newVariant]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: string | number) => {
    const updatedVariants = variants.map((v, i) => {
      if (i !== index) return v;
      
      const updated = { ...v, [field]: value };
      
      // Regenerate SKU when size or color changes
      if (field === 'size' || field === 'color') {
        updated.sku = generateSKU(productName, updated.size, updated.color);
      }
      
      return updated;
    });
    
    setVariants(updatedVariants);
  };

  return {
    variants,
    setVariants,
    addVariant,
    removeVariant,
    updateVariant,
  };
}
