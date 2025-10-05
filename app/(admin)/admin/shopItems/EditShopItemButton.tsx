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
import type { ShopItem } from '@/types/shop';
import {
  updateShopItem,
  uploadShopItemImage,
  type ShopItemUpdate,
} from '@/services/shopItemUtils';

export default function EditShopItemButton({
  item,
  onSaved,
}: {
  item: ShopItem;
  onSaved: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description || '');
  const [price, setPrice] = useState<string>(String(item.price));
  const [quantity, setQuantity] = useState<string>(String(item.quantity));
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(item.images || []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item.id) return;
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

      const patch: ShopItemUpdate = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        quantity: Number(quantity),
      };

      // Upload new images if any
      const uploadedImageUrls: string[] = [];
      for (const file of newImageFiles) {
        const imageUrl = await uploadShopItemImage(file);
        uploadedImageUrls.push(imageUrl);
      }

      // Combine existing and new images
      patch.images = [...existingImages, ...uploadedImageUrls];

      await updateShopItem(item.id, patch);
      setOpen(false);
      await onSaved();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to save item');
    } finally {
      setSaving(false);
    }
  }

  function removeExistingImage(index: number) {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  }

  function removeNewImage(index: number) {
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shop Item</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="space-y-2">
              <Label>Current Images</Label>
              <div className="flex flex-wrap gap-2">
                {existingImages.map((url, idx) => (
                  <div key={idx} className="relative">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                      <Image
                        src={url}
                        alt={`${item.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeExistingImage(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images Preview */}
          {newImageFiles.length > 0 && (
            <div className="space-y-2">
              <Label>New Images to Upload</Label>
              <div className="flex flex-wrap gap-2">
                {newImageFiles.map((file, idx) => (
                  <div key={idx} className="relative">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`New ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full p-0"
                      onClick={() => removeNewImage(idx)}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="eimage">Add Images</Label>
            <Input
              id="eimage"
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setNewImageFiles([...newImageFiles, ...files]);
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ename">Name</Label>
            <Input
              id="ename"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edesc">Description (optional)</Label>
            <textarea
              id="edesc"
              className="w-full rounded-md border p-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="eprice">Price ($)</Label>
              <Input
                id="eprice"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equantity">Quantity</Label>
              <Input
                id="equantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <div>Reviews: {item.total_reviews} ({item.review_score.toFixed(1)}/5)</div>
            <div>Total Purchases: {item.purchases}</div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>
              {saving ? 'Saving…' : 'Save'}
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
