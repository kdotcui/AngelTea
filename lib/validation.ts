import { ProductVariant } from '@/types/shop';

export interface ShopItemFormData {
  name: string;
  type: string;
  price: string;
  quantity: string;
  hasVariants: boolean;
  variants: ProductVariant[];
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates shop item form data
 */
export function validateShopItemForm(data: ShopItemFormData): ValidationResult {
  if (!data.name.trim()) {
    return { isValid: false, error: 'Name is required.' };
  }
  
  if (!data.type.trim()) {
    return { isValid: false, error: 'Type is required.' };
  }
  
  if (Number.isNaN(Number(data.price)) || Number(data.price) < 0) {
    return { isValid: false, error: 'Enter a valid price.' };
  }
  
  if (!data.hasVariants && (Number.isNaN(Number(data.quantity)) || Number(data.quantity) < 0)) {
    return { isValid: false, error: 'Enter a valid quantity.' };
  }
  
  if (data.hasVariants && data.variants.length === 0) {
    return { isValid: false, error: 'Add at least one variant or disable variants.' };
  }
  
  return { isValid: true };
}

/**
 * Validates pricing data for drinks
 */
export function validateDrinkPricing(
  pricingMode: 'single' | 'sizes',
  price: string,
  sizes: Array<{ label: string; price: number }>
): ValidationResult {
  if (pricingMode === 'single') {
    if (price === '' || Number.isNaN(Number(price))) {
      return { isValid: false, error: 'Enter a valid price or switch to Multiple sizes.' };
    }
  } else {
    const validSizes = (sizes ?? []).filter(
      (s) => s.label.trim() && !Number.isNaN(Number(s.price))
    );
    if (validSizes.length === 0) {
      return { isValid: false, error: 'Add at least one size with a label and price.' };
    }
  }
  
  return { isValid: true };
}
