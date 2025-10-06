import { WithFieldValue } from "firebase/firestore";

export interface ProductVariant {
  sku: string;        
  size?: string;
  color?: string;
  stock: number;      
  price?: number;     
}

// The main product, as stored in your 'products' collection
export interface ShopItem {
  id: string;
  name: string;
  price: number;
  images?: string[];
  description?: string;
  type: string;        // e.g., "clothing", "art", "merchandise"
  // For items WITHOUT variants (e.g., art)
  quantity?: number;
  // For items WITH variants (e.g., clothes)
  variants?: ProductVariant[];
  // Analytics/Display data
  total_reviews: number;
  review_score: number;  // Total cumulative score (average = review_score / total_reviews)
  purchases: number;
  artist?: string;       // For art pieces
}

export type CreateShopItemType = WithFieldValue<Omit<ShopItem, 'id'>>;
