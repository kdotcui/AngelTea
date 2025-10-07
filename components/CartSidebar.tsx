"use client";
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { createPaymentLink, formatCartItemsForCheckout } from '@/services/checkout';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    setCheckoutError(null);

    try {
      // Format cart items for checkout
      const checkoutItems = formatCartItemsForCheckout(cart);
      
      // Create payment link
      const { url } = await createPaymentLink(checkoutItems);
      
      // Redirect to Stripe checkout
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      setCheckoutError(error instanceof Error ? error.message : 'Failed to process checkout');
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-[410px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-bold">Shopping Cart</SheetTitle>
        </SheetHeader>

        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Your cart is empty</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 border rounded-lg">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{item.name}</h3>
                    
                    {/* Show variant details if available */}
                    {item.selectedVariant && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.selectedVariant.color && <span>Color: {item.selectedVariant.color}</span>}
                        {item.selectedVariant.color && item.selectedVariant.size && <span> • </span>}
                        {item.selectedVariant.size && <span>Size: {item.selectedVariant.size}</span>}
                      </div>
                    )}
                    
                    <p className="text-sm text-muted-foreground mt-1">
                      ${(item.selectedVariant?.price ?? item.price).toFixed(2)} each
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.cartQuantity - 1, item.selectedVariant?.sku)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">
                        {item.cartQuantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.cartQuantity + 1, item.selectedVariant?.sku)}
                        disabled={item.cartQuantity >= (item.selectedVariant?.stock ?? item.quantity ?? Infinity)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeFromCart(item.id, item.selectedVariant?.sku)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Item Total */}
                  <div className="text-right">
                    <p className="font-semibold">
                      ${((item.selectedVariant?.price ?? item.price) * item.cartQuantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <SheetFooter className="flex-col gap-4 sm:flex-col">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-bold border-t pt-4">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {/* Error Message */}
              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {checkoutError}
                </div>
              )}

              {/* Checkout and Clear Cart Buttons */}
              <div className="flex gap-2 w-full">
                <Button
                    variant="outline"
                    className="flex-1"
                    size="lg"
                    onClick={clearCart}
                    disabled={isCheckingOut}
                >
                  Clear Cart
                </Button>
                <Button 
                  className="flex-[3] bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>

              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

