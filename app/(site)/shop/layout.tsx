"use client";
import { CartProvider } from '@/context/CartContext';
import dynamic from 'next/dynamic';
const BottomNav = dynamic(() => import('@/components/BottomNav'), { ssr: false });

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen pb-16 sm:pb-0">
        {children}
        <BottomNav />
      </div>
    </CartProvider>
  ); 
}

