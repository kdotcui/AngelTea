"use client";
import { useState} from 'react';
import { ShopItem } from '@/types/ShopItem';
import ItemPreviewCard from './ItemPreviewCard';
import ItemPreviewModal from './ItemPreviewModal';
// TODO: Remove this and replace with items stored in firebase.
import { products } from './hardcodedProducts';

export default function ShopPage() {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Angel Tea Merchandise</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ItemPreviewCard
            key={product.id}
            product={product}
            onClick={() => setSelectedItem(product)}
          />
        ))}
      </div>
      <ItemPreviewModal 
        item={selectedItem || products[0]} 
        open={selectedItem !== null} 
        onClose={() => setSelectedItem(null)} 
      />
    </div>
  );
}
