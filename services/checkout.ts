import { CheckoutItem, PaymentLinkResponse, CartItem } from '@/types/shop';

/**
 * Creates a Stripe payment link for the given cart items
 * @param items - Array of checkout items from the cart
 * @returns The payment link URL and ID
 */
export async function createPaymentLink(items: CheckoutItem[]): Promise<PaymentLinkResponse> {
  const response = await fetch('/api/checkout/create-payment-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create payment link');
  }

  return response.json();
}

/**
 * Converts cart items to checkout items format
 * @param cartItems - Items from the shopping cart
 * @returns Formatted checkout items
 */
export function formatCartItemsForCheckout(cartItems: CartItem[]): CheckoutItem[] {
  return cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.cartQuantity,
    images: item.images,
    selectedVariant: item.selectedVariant,
  }));
}

