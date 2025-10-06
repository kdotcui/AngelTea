"use client";
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function CartHeader() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <ShoppingCart className="h-8 w-8 text-gray-700" />
        {totalItems > 0 && (
          <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {totalItems}
          </div>
        )}
      </div>
    </div>
  );
}

