"use client";
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import CartSidebar from './CartSidebar';

export default function CartHeader() {
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="fixed top-4 right-4 z-50 hover:scale-110 transition-transform cursor-pointer"
        aria-label="Open shopping cart"
      >
        <div className="relative">
          <ShoppingCart className="h-8 w-8 text-gray-700" />
          {totalItems > 0 && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
              {totalItems}
            </div>
          )}
        </div>
      </button>
      
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}

