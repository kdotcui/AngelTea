"use client";
import { CartProvider } from '@/context/CartContext';

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  ); 
}

