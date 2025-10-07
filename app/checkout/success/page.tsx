"use client";

import { useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CheckoutSuccessPage() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart after successful checkout
    clearCart();
  }, [clearCart]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. Your order has been confirmed and is being processed.
          You will receive an email confirmation shortly.
        </p>

        <div className="space-y-3">
          <Link href="/" className="block">
            <Button className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
          
          <Link href="/shop" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Browse Our Shop
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          Need help? <Link href="/contact" className="text-green-600 hover:underline">Contact us</Link>
        </p>
      </div>
    </div>
  );
}

