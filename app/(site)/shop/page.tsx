import { ShopItem } from './types';
import ItemPreview from './ItemPreview';

const products: ShopItem[] = [
  {
    id: 'premium-matcha-tea',
    name: 'Premium Matcha Tea',
    price: 24.99,
    images: ['/menu/drinksleft.webp', '/menu/drinksright.webp'],
    quantity: 50,
    description: 'High-quality ceremonial grade matcha powder from Japan',
    total_reviews: 127,
    review_score: 609, // 127 reviews with average 4.8/5 = 127 * 4.8 = 609.6
    purchases: 342
  },
  {
    id: 'chocolate-croissant',
    name: 'Chocolate Croissant',
    price: 4.50,
    images: ['/menu/dessertleft.webp', '/menu/dessertright.webp'],
    quantity: 25,
    description: 'Freshly baked buttery croissant filled with rich chocolate',
    total_reviews: 89,
    review_score: 409, // 89 reviews with average 4.6/5 = 89 * 4.6 = 409.4
    purchases: 156
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Toast',
    price: 12.99,
    images: ['/menu/foodleft.webp', '/menu/foodright.webp'],
    quantity: 15,
    description: 'Smashed avocado on artisan sourdough with cherry tomatoes',
    total_reviews: 203,
    review_score: 995, // 203 reviews with average 4.9/5 = 203 * 4.9 = 994.7
    purchases: 487
  },
  {
    id: 'iced-coffee',
    name: 'Iced Coffee',
    price: 3.75,
    images: ['/menu/drinksleft.webp'],
    quantity: 100,
    description: 'Cold brew coffee served over ice',
    total_reviews: 156,
    review_score: 686, // 156 reviews with average 4.4/5 = 156 * 4.4 = 686.4
    purchases: 234
  },
  {
    id: 'blueberry-muffin',
    name: 'Blueberry Muffin',
    price: 3.25,
    images: ['/menu/dessertleft.webp'],
    quantity: 30,
    description: 'Moist muffin packed with fresh blueberries',
    total_reviews: 67,
    review_score: 281, // 67 reviews with average 4.2/5 = 67 * 4.2 = 281.4
    purchases: 89
  }
];

export default function ShopPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">All Items</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ItemPreview key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
