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
import type { PopularDrink, DrinkSizePrice } from '@/types/drink';
import {
  updatePopularDrink,
  uploadPopularImage,
  type PopularDrinkUpdate,
} from '@/services/popularDrinks';
import { deleteField, type FieldValue } from 'firebase/firestore';
import type { DrinkSizePrice as DrinkSizePriceType } from '@/types/drink';

type DrinkUpdatePayload = PopularDrinkUpdate;
export default function EditDrinkButton({
  drink,
  onSaved,
}: {
  drink: PopularDrink;
  onSaved: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(drink.title);
  const [description, setDescription] = useState(drink.description);
  const [price, setPrice] = useState<string>(
    typeof drink.price === 'number' ? String(drink.price) : ''
  );
  const [sizes, setSizes] = useState<DrinkSizePrice[]>(drink.sizes ?? []);
  const [saving, setSaving] = useState(false);
  const [pricingMode, setPricingMode] = useState<'single' | 'sizes'>(
    drink.sizes && drink.sizes.length > 0 ? 'sizes' : 'single'
  );
  const [status, setStatus] = useState<string | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!drink.id) return;
    setSaving(true);
    setStatus(null);
    try {
      // Validate mutually exclusive pricing
      if (pricingMode === 'single') {
        if (price === '' || Number.isNaN(Number(price))) {
          setStatus('Enter a valid price or switch to Multiple sizes.');
          setSaving(false);
          return;
        }
      } else {
        const validSizes = (sizes ?? []).filter(
          (s) => s.label.trim() && !Number.isNaN(Number(s.price))
        );
        if (validSizes.length === 0) {
          setStatus('Add at least one size with a label and price.');
          setSaving(false);
          return;
        }
      }

      const patch: DrinkUpdatePayload = { title, description };
      if (newImageFile) {
        const imageUrl = await uploadPopularImage(newImageFile);
        patch.imageUrl = imageUrl;
      }
      if (pricingMode === 'single') {
        patch.price = Number(price) as number & FieldValue;
        // use a separate payload to include FieldValue with correct typing
        const payload: DrinkUpdatePayload = {
          ...patch,
          sizes: deleteField(),
        };
        await updatePopularDrink(drink.id, payload);
        setOpen(false);
        await onSaved();
        return;
      } else {
        const payload: DrinkUpdatePayload = {
          ...patch,
          price: deleteField(),
          sizes: (sizes ?? [])
            .filter((s) => s.label.trim() && !Number.isNaN(Number(s.price)))
            .map((s) => ({ label: s.label.trim(), price: Number(s.price) })),
        };
        await updatePopularDrink(drink.id, payload);
        setOpen(false);
        await onSaved();
        return;
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Drink</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          {drink.imageUrl ? (
            <div className="relative h-36 w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={
                  newImageFile
                    ? URL.createObjectURL(newImageFile)
                    : drink.imageUrl
                }
                alt={drink.title}
                fill
                className="object-cover"
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="eimage">Replace Image</Label>
            <Input
              id="eimage"
              type="file"
              accept="image/*"
              onChange={(e) => setNewImageFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="etitle">Title</Label>
            <Input
              id="etitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Pricing</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={pricingMode === 'single' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPricingMode('single')}
              >
                Single price
              </Button>
              <Button
                type="button"
                variant={pricingMode === 'sizes' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPricingMode('sizes')}
              >
                Multiple sizes
              </Button>
            </div>
          </div>
          {pricingMode === 'single' ? (
            <div className="space-y-2">
              <Label htmlFor="eprice">Price</Label>
              <Input
                id="eprice"
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
          ) : null}
          {pricingMode === 'sizes' ? (
            <div className="space-y-2">
              <Label>Sizes & Prices</Label>
              <div className="space-y-2">
                {sizes.map((sp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Size label (e.g., Regular)"
                      value={sp.label}
                      onChange={(e) => {
                        const next = [...sizes];
                        next[idx] = { ...next[idx], label: e.target.value };
                        setSizes(next);
                      }}
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      value={sp.price ? String(sp.price) : ''}
                      onChange={(e) => {
                        const next = [...sizes];
                        next[idx] = {
                          ...next[idx],
                          price: Number(e.target.value),
                        };
                        setSizes(next);
                      }}
                    />
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setSizes(sizes.filter((_, i) => i !== idx))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setSizes([...(sizes ?? []), { label: '', price: 0 }])
                }
              >
                Add size
              </Button>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="edesc">Description</Label>
            <Input
              id="edesc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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
            <p className="text-sm text-muted-foreground">{status}</p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
