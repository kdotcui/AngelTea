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
import {
  createShopItem,
  uploadShopItemImage,
} from '@/services/shopItemUtils';
import { CreateShopItemType, ProductVariant } from '@/types/shop';
import { Trash2, Plus } from 'lucide-react';

const STANDARD_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', 'ONE SIZE'] as const;

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
  const [type, setType] = useState('');
  const [artist, setArtist] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  
  // Variants state
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

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
        type: type.trim(),
        images: uploadedImageUrls,
        total_reviews: 0,
        review_score: 0,
        purchases: 0,
        ...(hasVariants ? { variants } : { quantity: Number(quantity) }),
        ...(artist.trim() && { artist: artist.trim() }),
      };

      await createShopItem(newItem);
      
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setQuantity('');
      setType('');
      setArtist('');
      setImageFiles([]);
      setHasVariants(false);
      setVariants([]);
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
            <Label htmlFor="type">Type *</Label>
            <Input
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              placeholder="e.g., clothing, art, merchandise"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="artist">Artist (optional, for art pieces)</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
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

          <div className="space-y-2">
            <Label htmlFor="price">Base Price ($) *</Label>
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

          {/* Variants Toggle */}
          <div className="flex items-center space-x-2 py-2 border-t border-b">
            <input
              type="checkbox"
              id="hasVariants"
              checked={hasVariants}
              onChange={(e) => setHasVariants(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="hasVariants" className="cursor-pointer">
              This product has variants (e.g., different sizes/colors)
            </Label>
          </div>

          {!hasVariants ? (
            <div className="space-y-2">
              <Label htmlFor="quantity">Stock Quantity *</Label>
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
