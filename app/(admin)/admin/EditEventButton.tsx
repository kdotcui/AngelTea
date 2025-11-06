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
import type { Event } from '@/types/event';
import {
  updateEvent,
  uploadEventImage,
} from '@/services/events';

// Validate time format XX:XX
function validateTimeFormat(time: string): boolean {
  if (!time.trim()) return true; // Empty is valid (optional field)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time.trim());
}

export default function EditEventButton({
  event,
  onSaved,
}: {
  event: Event;
  onSaved: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description ?? '');
  const [date, setDate] = useState(event.date);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState(event.location ?? '');
  const [price, setPrice] = useState(event.price.toString());
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  // Initialize startTime and endTime from event data
  useEffect(() => {
    setStartTime(event.startTime ?? '');
    setEndTime(event.endTime ?? '');
    setPrice(event.price.toString());
  }, [event.startTime, event.endTime, event.price, open]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event.id) return;
    if (!title.trim()) {
      setStatus('Title is required');
      return;
    }
    if (!date) {
      setStatus('Date is required');
      return;
    }
    if (!price.trim()) {
      setStatus('Price is required');
      return;
    }
    const priceNum = parseFloat(price.trim());
    if (isNaN(priceNum) || priceNum < 0) {
      setStatus('Price must be a valid non-negative number');
      return;
    }
    if (startTime && !validateTimeFormat(startTime)) {
      setStatus('Start time must be in XX:XX format (e.g., 06:00 or 14:30)');
      return;
    }
    if (endTime && !validateTimeFormat(endTime)) {
      setStatus('End time must be in XX:XX format (e.g., 06:00 or 14:30)');
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const patch: Partial<Omit<Event, 'id'>> = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        location: location.trim() || undefined,
        price: priceNum,
      };
      if (newImageFile) {
        const imageUrl = await uploadEventImage(newImageFile);
        patch.imageUrl = imageUrl;
      }
      await updateEvent(event.id, patch);
      setOpen(false);
      await onSaved();
    } catch (error) {
      console.error('Update event failed', error);
      setStatus('Failed to save event');
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
          <DialogTitle>Edit Event</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          {event.imageUrl ? (
            <div className="relative h-36 w-full overflow-hidden rounded-md bg-muted">
              <Image
                src={
                  newImageFile
                    ? URL.createObjectURL(newImageFile)
                    : event.imageUrl
                }
                alt={event.title}
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
            <Label htmlFor="etitle">Title *</Label>
            <Input
              id="etitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edesc">Description</Label>
            <textarea
              id="edesc"
              className="w-full rounded-md border p-2 text-sm"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="flex items-center gap-3">
              <Input
                id="edate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-48"
              />
              <div className="flex items-center gap-2">
                <Input
                  id="estart-time"
                  type="text"
                  placeholder="Start (XX:XX)"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  id="eend-time"
                  type="text"
                  placeholder="End (XX:XX)"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-24"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Time format: XX:XX (e.g., 06:00 or 14:30)
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="elocation">Location</Label>
            <Input
              id="elocation"
              placeholder="e.g., Angel Tea, 331 Moody St"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="eprice">Price *</Label>
            <Input
              id="eprice"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g., 25.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
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

