'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  createShopItem,
  uploadShopItemImage,
} from '@/services/shopItemUtils';
import { CreateShopItemType } from '@/types/shop';

export default function AddShopItemButton({
  onAdded,
}: {
  onAdded: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      // Validate inputs
      if (!name.trim()) {
        setStatus('Name is required.');
        setSaving(false);
        return;
      }
      if (Number.isNaN(Number(price)) || Number(price) < 0) {
        setStatus('Enter a valid price.');
        setSaving(false);
        return;
      }
      if (Number.isNaN(Number(quantity)) || Number(quantity) < 0) {
        setStatus('Enter a valid quantity.');
        setSaving(false);
        return;
      }

      // Upload images if any
      const uploadedImageUrls: string[] = [];
      for (const file of imageFiles) {
        const imageUrl = await uploadShopItemImage(file);
        uploadedImageUrls.push(imageUrl);
      }

      // Create the new shop item with defaults for review/purchase fields
      const newItem: CreateShopItemType = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        quantity: Number(quantity),
        images: uploadedImageUrls,
        total_reviews: 0,
        review_score: 0,
        purchases: 0, 
      };

      await createShopItem(newItem);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setImageFiles([]);
      setOpen(false);
      await onAdded();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to create item');
    } finally {
      setSaving(false);
    }
  }

  function removeImage(index: number) {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          Add Shop Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Shop Item</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          {/* Image Preview */}
          {imageFiles.length > 0 && (
            <div className="space-y-2">
              <Label>Images to Upload</Label>
              <div className="flex flex-wrap gap-2">
                {imageFiles.map((file, idx) => (
                  <div key={idx} className="relative">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`Image ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeImage(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="desc">Description (optional)</Label>
            <textarea
              id="desc"
              className="w-full rounded-md border p-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Add Images (optional)</Label>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImageFiles([...imageFiles, ...files]);
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>* Required fields</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Creating…' : 'Create Item'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </div>
          {status ? (
            <p className="text-sm text-red-600">{status}</p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
