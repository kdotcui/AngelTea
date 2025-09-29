export type DrinkSizePrice = {
  label: string;
  price: number;
};

export type PopularDrink = {
  id?: string;
  title: string;
  description: string;
  imageUrl: string;
  price?: number;
  sizes?: DrinkSizePrice[];
  story?: string;
  videoUrl?: string;
  createdAt?: unknown;
};
