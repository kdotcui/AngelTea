"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ShopItem, ProductVariant } from '@/types/shop';

interface CartItem extends ShopItem {
  cartQuantity: number;
  selectedVariant?: ProductVariant; // The specific variant chosen (if product has variants)
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: ShopItem, selectedVariant?: ProductVariant) => void;
  removeFromCart: (itemId: string, variantSku?: string) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  updateQuantity: (itemId: string, quantity: number, variantSku?: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('angelTeaCart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('angelTeaCart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  const addToCart = (item: ShopItem, selectedVariant?: ProductVariant) => {
    setCart((prevCart) => {
      // Find existing cart item: match by ID and variant SKU (if variant exists)
      const existingItem = prevCart.find((cartItem) => {
        const idMatches = cartItem.id === item.id;
        const variantMatches = selectedVariant 
          ? cartItem.selectedVariant?.sku === selectedVariant.sku
          : !cartItem.selectedVariant;
        return idMatches && variantMatches;
      });
      
      if (existingItem) {
        // Item already in cart, increase quantity
        return prevCart.map((cartItem) => {
          const idMatches = cartItem.id === item.id;
          const variantMatches = selectedVariant 
            ? cartItem.selectedVariant?.sku === selectedVariant.sku
            : !cartItem.selectedVariant;
          return idMatches && variantMatches
            ? { ...cartItem, cartQuantity: cartItem.cartQuantity + 1 }
            : cartItem;
        });
      } else {
        // New item, add to cart with quantity 1
        return [...prevCart, { ...item, selectedVariant, cartQuantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string, variantSku?: string) => {
    setCart((prevCart) => prevCart.filter((item) => {
      const idMatches = item.id === itemId;
      if (!idMatches) {
        return true; // Keep items that don't match ID
      }
      // If variantSku provided, only remove if both ID and SKU match
      if (variantSku) {
        return item.selectedVariant?.sku !== variantSku;
      }
      // If no variantSku provided and item has no variant, remove it
      return !!item.selectedVariant;
    }));
  };

  const updateQuantity = (itemId: string, quantity: number, variantSku?: string) => {
    if (quantity <= 0) {
      removeFromCart(itemId, variantSku);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) => {
        const idMatches = item.id === itemId;
        const variantMatches = variantSku 
          ? item.selectedVariant?.sku === variantSku
          : !item.selectedVariant;
        return idMatches && variantMatches
          ? { ...item, cartQuantity: quantity }
          : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.cartQuantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      // Use variant price if available, otherwise use base price
      const itemPrice = item.selectedVariant?.price ?? item.price;
      return total + itemPrice * item.cartQuantity;
    }, 0);
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice,
    updateQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

