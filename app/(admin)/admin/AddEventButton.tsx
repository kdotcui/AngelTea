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
  createEvent,
  uploadEventImage,
} from '@/services/events';

// Validate time format XX:XX
function validateTimeFormat(time: string): boolean {
  if (!time.trim()) return true; // Empty is valid (optional field)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time.trim());
}

export default function AddEventButton({
  onAdded,
}: {
  onAdded: () => Promise<void> | void;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setStatus('Title is required');
      return;
    }
    if (!date) {
      setStatus('Date is required');
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
      const payload: Omit<import('@/types/event').Event, 'id' | 'createdAt'> = {
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        startTime: startTime.trim() || undefined,
        endTime: endTime.trim() || undefined,
        location: location.trim() || undefined,
      };
      if (imageFile) {
        const imageUrl = await uploadEventImage(imageFile);
        payload.imageUrl = imageUrl;
      }
      await createEvent(payload);
      
      // Reset form
      setTitle('');
      setDescription('');
      setDate('');
      setStartTime('');
      setEndTime('');
      setLocation('');
      setImageFile(null);
      setOpen(false);
      await onAdded();
    } catch (error) {
      console.error('Create event failed', error);
      setStatus('Failed to save event');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Event</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <textarea
              id="desc"
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
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-48"
              />
              <div className="flex items-center gap-2">
                <Input
                  id="start-time"
                  type="text"
                  placeholder="Start (XX:XX)"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-24"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  id="end-time"
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
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Angel Tea, 331 Moody St"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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

