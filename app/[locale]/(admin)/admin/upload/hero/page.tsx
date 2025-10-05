'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createHeroSlide, uploadHeroImage } from '@/services/heroSlides';

export default function UploadHeroSlidePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [href, setHref] = useState('');
  const [order, setOrder] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setStatus('Image is required');
      return;
    }
    if (!order || Number.isNaN(Number(order))) {
      setStatus('Position (order) is required');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const imageUrl = await uploadHeroImage(imageFile);
      await createHeroSlide({
        title: title || undefined,
        description: description || undefined,
        href: href || undefined,
        order: Number(order),
        imageUrl,
      });
      router.push('/admin');
    } catch (e: unknown) {
      // Log detailed error for debugging
      console.error('Upload hero failed', e);
      const message = (e as { message?: string })?.message ?? 'Failed to save';
      setStatus(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto min-h-[80vh] max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Hero Slide</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description (optional)</Label>
              <Input
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">Link (optional)</Label>
              <Input
                id="href"
                value={href}
                onChange={(e) => setHref(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Position</Label>
              <Input
                id="order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
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
                {saving ? 'Saving…' : 'Save'}
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
