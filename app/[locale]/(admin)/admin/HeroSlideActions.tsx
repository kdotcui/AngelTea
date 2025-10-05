'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
  deleteHeroSlide,
  updateHeroSlide,
  uploadHeroImage,
} from '@/services/heroSlides';

import type { HeroSlide } from '@/types/hero';

export default function HeroSlideActions({
  slide,
  onChanged,
}: {
  slide: HeroSlide;
  onChanged: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState<string>(slide.title ?? '');
  const [href, setHref] = useState<string>(slide.href ?? '');
  const [order, setOrder] = useState<string>(
    typeof slide.order === 'number' ? String(slide.order) : ''
  );
  const [newImage, setNewImage] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!slide.id) return;
    if (!order || Number.isNaN(Number(order))) return;
    setSaving(true);
    try {
      const patch: Partial<Omit<HeroSlide, 'id'>> = {
        title: title || undefined,
        href: href || undefined,
        order: Number(order),
      };
      if (newImage) {
        const url = await uploadHeroImage(newImage);
        patch.imageUrl = url;
      }
      await updateHeroSlide(slide.id, patch);
      setOpen(false);
      await onChanged();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!slide.id) return;
    await deleteHeroSlide(slide.id);
    await onChanged();
  }

  return (
    <div className="flex gap-2">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hero Slide</DialogTitle>
          </DialogHeader>
          <form className="space-y-3" onSubmit={onSave}>
            <div className="space-y-2">
              <Label htmlFor="htitle">Title</Label>
              <Input
                id="htitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hlink">Link</Label>
              <Input
                id="hlink"
                value={href}
                onChange={(e) => setHref(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horder">Position</Label>
              <Input
                id="horder"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="himg">Replace Image</Label>
              <Input
                id="himg"
                type="file"
                accept="image/*"
                onChange={(e) => setNewImage(e.target.files?.[0] ?? null)}
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
          </form>
        </DialogContent>
      </Dialog>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        Delete
      </Button>
    </div>
  );
}
