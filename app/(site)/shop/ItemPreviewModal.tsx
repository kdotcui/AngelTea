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
import { useState } from 'react';

interface ItemPreviewModalProps {
  item: ShopItem;
  onClose: () => void;
  open: boolean;
}

export default function ItemPreviewModal({ item, onClose, open }: ItemPreviewModalProps) {
  const rating = item.total_reviews > 0 ? (item.review_score / item.total_reviews).toFixed(1) : '0.0';
  const { addToCart } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(item);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 300); // Reset after 2 seconds
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
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">
                      {rating}/5
                    </span>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {item.purchases} purchases
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.total_reviews} reviews
                  </Badge>
                  <Badge 
                    variant={item.quantity > 10 ? "default" : item.quantity > 0 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {item.quantity > 0 ? `${item.quantity} in stock` : 'Out of stock'}
                  </Badge>
                </div>

                {/* Add to Cart Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={item.quantity <= 0 || isAdded}
                    className="w-full"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isAdded ? 'Added to Cart!' : item.quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
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


