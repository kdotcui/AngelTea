"use client";
import { useState, useEffect } from 'react';
import { ShopItem } from '@/types/shop';
import { getShopItems } from '@/services/shopItemUtils';
import ItemPreviewCard from './ItemPreviewCard';
import ItemPreviewModal from './ItemPreviewModal';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [loading, setLoading] = useState(true);
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  useEffect(() => {
    async function fetchShopItems() {
      try {
        const fetchedItems = await getShopItems();
        setItems(fetchedItems);
      } catch (error) {
        console.error('Error fetching shop items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchShopItems();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="relative mb-8">
          <h1 className="text-3xl font-bold text-center">Angel Tea Merchandise</h1>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <ShoppingCart className="h-8 w-8 text-gray-700" />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {totalItems}
              </div>
            )}
          </div>
        </div>
        <Image src="/loading.gif" alt="Loading" width={500} height={500} className="mx-auto block" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative mb-8">
        <h1 className="text-3xl font-bold text-center">Angel Tea Merchandise</h1>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ShoppingCart className="h-8 w-8 text-gray-700" />
          {totalItems > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {totalItems}
            </div>
          )}
        </div>
      </div>
      {items.length === 0 ? (
        <div className="text-center text-gray-500">No items available</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => (
            <ItemPreviewCard
              key={product.id}
              product={product}
              onClick={() => setSelectedItem(product)}
            />
          ))}
        </div>
      )}
      {selectedItem && (
        <ItemPreviewModal 
          item={selectedItem} 
          open={selectedItem !== null} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
}
