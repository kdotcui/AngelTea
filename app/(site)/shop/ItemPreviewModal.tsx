"use client";
import { ShopItem } from '@/types/shop';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useState, useMemo, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { trackEvent } from '@/lib/analytics';

interface ItemPreviewModalProps {
  item: ShopItem;
  onClose: () => void;
  open: boolean;
}

export default function ItemPreviewModal({ item, onClose, open }: ItemPreviewModalProps) {
  const rating = item.total_reviews > 0 ? (item.review_score / item.total_reviews).toFixed(1) : '0.0';
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);
  
  // Variant selection state
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');

  // Extract unique sizes and colors from variants
  const availableSizes = useMemo(() => {
    if (!item.variants) return [];
    const sizes = [...new Set(item.variants.map(v => v.size).filter(Boolean))];
    return sizes as string[];
  }, [item.variants]);

  const availableColors = useMemo(() => {
    if (!item.variants) return [];
    const colors = [...new Set(item.variants.map(v => v.color).filter(Boolean))];
    return colors as string[];
  }, [item.variants]);

  // Find the selected variant based on size/color selection
  const selectedVariant = useMemo(() => {
    if (!item.variants) return undefined;
    return item.variants.find(v => {
      const sizeMatches = !selectedSize || v.size === selectedSize;
      const colorMatches = !selectedColor || v.color === selectedColor;
      return sizeMatches && colorMatches;
    });
  }, [item.variants, selectedSize, selectedColor]);

  // Get available stock
  const availableStock = item.variants 
    ? (selectedVariant?.stock ?? 0)
    : (item.quantity ?? 0);

  // Get current price (variant price or base price)
  const currentPrice = selectedVariant?.price ?? item.price;

  // Check if user needs to select variant options
  const needsVariantSelection = item.variants && item.variants.length > 0;
  const hasValidSelectedVariant = !needsVariantSelection || !!selectedVariant;

  // Track item view when modal opens
  useEffect(() => {
    if (open) {
      trackEvent('shop_item_view', {
        item_id: item.id,
        item_name: item.name,
        item_price: currentPrice,
      });
    }
  }, [open, item.id, item.name, currentPrice]);

  const handleAddToCart = () => {
    if (needsVariantSelection && !hasValidSelectedVariant) return;
    
    addToCart(item, selectedVariant);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 300);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="relative h-64 md:h-96 bg-muted">
            <Image
              src={item.images?.[0] || '/placeholder.jpg'}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Content Section */}
          <div className="p-6">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="text-2xl font-bold text-foreground">
                {item.name}
              </DialogTitle>
              {item.description && (
                <DialogDescription className="text-base text-muted-foreground">
                  {item.description}
                </DialogDescription>
              )}
            </DialogHeader>

            <Card className="mt-6 border-0 shadow-none p-0">
              <CardContent className="space-y-4 p-0">
                {/* Price and Rating */}
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-primary">
                    ${currentPrice.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {rating}/5
                    </span>
                  </div>
                </div>

                {/* Variant Selection */}
                {needsVariantSelection && (
                  <div className="space-y-3 pt-2 border-t">
                    {availableSizes.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="size-select" className="text-sm font-medium">
                          Select Size
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {availableSizes.map((size) => (
                            <Button
                              key={size}
                              type="button"
                              variant={selectedSize === size ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedSize(size)}
                              className="min-w-[3rem]"
                            >
                              {size}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}

                    {availableColors.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="color-select" className="text-sm font-medium">
                          Select Color
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {availableColors.map((color) => (
                            <Button
                              key={color}
                              type="button"
                              variant={selectedColor === color ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedColor(color)}
                            >
                              {color}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.purchases} purchases
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.total_reviews} reviews
                  </Badge>
                  <Badge 
                    variant={availableStock > 10 ? "default" : availableStock > 0 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
                  </Badge>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={availableStock <= 0 || isAdded || (needsVariantSelection && !hasValidSelectedVariant)}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isAdded 
                      ? 'Added to Cart!' 
                      : availableStock <= 0 
                      ? 'Out of Stock' 
                      : needsVariantSelection && !hasValidSelectedVariant
                      ? 'Select Options'
                      : 'Add to Cart'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


