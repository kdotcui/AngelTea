'use client';

import { useState, useEffect } from 'react';
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
import type { ShopItem, ProductVariant } from '@/types/shop';
import {
  updateShopItem,
  uploadShopItemImage,
  type ShopItemUpdate,
} from '@/services/shopItemUtils';
import { Trash2, Plus } from 'lucide-react';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'ONE SIZE'] as const;

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
  const [quantity, setQuantity] = useState<string>(String(item.quantity ?? 0));
  const [type, setType] = useState(item.type || '');
  const [artist, setArtist] = useState(item.artist || '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(item.images || []);
  
  // Variants state
  const [hasVariants, setHasVariants] = useState(!!item.variants && item.variants.length > 0);
  const [variants, setVariants] = useState<ProductVariant[]>(item.variants || []);

  // Generate SKU from name, size, and color
  const generateSKU = (productName: string, size?: string, color?: string): string => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const sanitizedName = productName
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    
    const parts = [sanitizedName];
    
    // Add color if present (remove spaces and special chars)
    if (color) {
      const sanitizedColor = color.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (sanitizedColor) parts.push(sanitizedColor);
    }
    
    // Add size if present
    if (size) {
      const sanitizedSize = size.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (sanitizedSize) parts.push(sanitizedSize);
    }
    
    return parts.join('-');
  };

  // Update all variant SKUs when product name changes
  useEffect(() => {
    if (variants.length > 0 && name) {
      const updatedVariants = variants.map(v => ({
        ...v,
        sku: generateSKU(name, v.size, v.color)
      }));
      setVariants(updatedVariants);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

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
      if (!type.trim()) {
        setStatus('Type is required.');
        setSaving(false);
        return;
      }
      if (Number.isNaN(Number(price)) || Number(price) < 0) {
        setStatus('Enter a valid price.');
        setSaving(false);
        return;
      }
      if (!hasVariants && (Number.isNaN(Number(quantity)) || Number(quantity) < 0)) {
        setStatus('Enter a valid quantity.');
        setSaving(false);
        return;
      }
      if (hasVariants && variants.length === 0) {
        setStatus('Add at least one variant or disable variants.');
        setSaving(false);
        return;
      }

      const patch: ShopItemUpdate = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        type: type.trim(),
        ...(hasVariants ? { variants } : { quantity: Number(quantity), variants: [] }),
        ...(artist.trim() && { artist: artist.trim() }),
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

  function addVariant() {
    const newVariant: ProductVariant = {
      sku: generateSKU(name),
      stock: 0,
      size: '',
      color: ''
    };
    setVariants([...variants, newVariant]);
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof ProductVariant, value: string | number) {
    const updatedVariants = variants.map((v, i) => {
      if (i !== index) return v;
      
      const updated = { ...v, [field]: value };
      
      // Regenerate SKU when size or color changes
      if (field === 'size' || field === 'color') {
        updated.sku = generateSKU(name, updated.size, updated.color);
      }
      
      return updated;
    });
    
    setVariants(updatedVariants);
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

          <div className="space-y-2">
            <Label htmlFor="etype">Type *</Label>
            <Input
              id="etype"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., clothing, art, merchandise"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eartist">Artist (optional, for art pieces)</Label>
            <Input
              id="eartist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eprice">Base Price ($) *</Label>
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

          {/* Variants Toggle */}
          <div className="flex items-center space-x-2 py-2 border-t border-b">
            <input
              type="checkbox"
              id="ehasVariants"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="ehasVariants" className="cursor-pointer">
              This product has variants (e.g., different sizes/colors)
            </Label>
          </div>

          {!hasVariants ? (
            <div className="space-y-2">
              <Label htmlFor="equantity">Stock Quantity *</Label>
              <Input
                id="equantity"
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Product Variants</Label>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={addVariant}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Variant
                </Button>
              </div>
              
              {variants.map((variant, idx) => (
                <div key={idx} className="p-3 border rounded-md space-y-2 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Variant {idx + 1}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => removeVariant(idx)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Auto-generated SKU</Label>
                      <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        {variant.sku || 'Enter size/color'}
                      </span>
                    </div>
                    <div>
                      <Label className="text-xs">Stock *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                        placeholder="0"
                        className="h-8 text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-xs">Size</Label>
                      <select
                        value={variant.size || ''}
                        onChange={(e) => updateVariant(idx, 'size', e.target.value)}
                        className="h-8 text-sm w-full rounded-md border border-input bg-background px-3 py-1"
                      >
                        <option value="">Select size</option>
                        {STANDARD_SIZES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Input
                        value={variant.color || ''}
                        onChange={(e) => updateVariant(idx, 'color', e.target.value)}
                        placeholder="e.g., Blue"
                        className="h-8 text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Variant Price ($)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price || ''}
                        onChange={(e) => {
                          const newVariants = [...variants];
                          if (e.target.value) {
                            newVariants[idx] = { ...newVariants[idx], price: Number(e.target.value) };
                          } else {
                            // Remove price field if empty
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            const { price, ...rest } = newVariants[idx];
                            newVariants[idx] = rest as ProductVariant;
                          }
                          setVariants(newVariants);
                        }}
                        placeholder="Optional"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              {variants.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No variants added yet. Click &quot;Add Variant&quot; to create one.
                </p>
              )}
            </div>
          )}

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
