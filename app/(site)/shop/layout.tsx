"use client";
import { CartProvider } from '@/context/CartContext';

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen">
        {children}
      </div>
    </CartProvider>
  ); 
}

