import { WithFieldValue } from "firebase/firestore";

export interface ShopItem {
  id: string;
  name: string;
  price: number;
  images?: string[];
  quantity: number;
  description?: string;
  total_reviews: number;
  review_score: number; // Score out of 5
  purchases: number;
}

export type CreateShopItemType = WithFieldValue<Omit<ShopItem, 'id'>>;
