'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  createPopularDrink,
  uploadPopularImage,
} from '@/services/popularDrinks';
import type { DrinkSizePrice } from '@/types/drink';

export default function UploadPopularDrinkPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [story, setStory] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [sizes, setSizes] = useState<DrinkSizePrice[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [pricingMode, setPricingMode] = useState<'single' | 'sizes'>('single');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !imageFile) {
      setStatus('Title and image are required');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      if (pricingMode === 'single') {
        if (price === '' || Number.isNaN(Number(price))) {
          setStatus('Enter a valid price or switch to Multiple sizes.');
          setSaving(false);
          return;
        }
      } else {
        const validSizes = sizes.filter(
          (s) => s.label.trim() && !Number.isNaN(Number(s.price))
        );
        if (validSizes.length === 0) {
          setStatus('Add at least one size with a label and price.');
          setSaving(false);
          return;
        }
      }

      const imageUrl = await uploadPopularImage(imageFile);

      const payload: any = {
        title,
        description,
        imageUrl,
        story,
        videoUrl,
      };
      if (pricingMode === 'single') {
        payload.price = Number(price);
      } else {
        payload.sizes = sizes
          .filter((s) => s.label.trim() && !Number.isNaN(Number(s.price)))
          .map((s) => ({ label: s.label.trim(), price: Number(s.price) }));
      }

      await createPopularDrink(payload);
      router.push('/admin');
    } catch (err) {
      setStatus('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-[80vh] max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Popular Drink</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
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
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
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
              <Label htmlFor="desc">Description</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="story">Story (optional)</Label>
              <textarea
                id="story"
                className="w-full rounded-md border p-2 text-sm"
                rows={5}
                value={story}
                onChange={(e) => setStory(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="video">Video URL (optional)</Label>
              <Input
                id="video"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
              {status ? (
                <span className="text-sm text-muted-foreground">{status}</span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
