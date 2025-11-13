'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Event, Attendee } from '@/types/event';
import { addAttendeeToEvent } from '@/services/events';

interface RegisterEventModalProps {
  event: Event;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRegistered?: () => void;
}

export function RegisterEventModal({
  event,
  open,
  onOpenChange,
  onRegistered,
}: RegisterEventModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Check if email already exists in attendees
    const existingAttendees = event.attendees || [];
    const emailExists = existingAttendees.some(
      (attendee) => attendee.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (emailExists) {
      setError('This email is already registered for this event');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create new attendee object
      const newAttendee: Attendee = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(phone.trim() && { phone: phone.trim() }),
      };

      // Add attendee to event using arrayUnion (more efficient - atomic operation)
      await addAttendeeToEvent(event.id!, newAttendee);

      // Reset form
      setName('');
      setEmail('');
      setPhone('');
      setError(null);

      // Close modal and notify parent
      onOpenChange(false);
      onRegistered?.();
    } catch (err) {
      console.error('Error registering for event:', err);
      setError('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setName('');
      setEmail('');
      setPhone('');
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register for {event.title}</DialogTitle>
          <DialogDescription>
            Fill out the form below to register for this event.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor={`register-name-${event.id}`}>
                  Full Name
                </FieldLabel>
                <Input
                  id={`register-name-${event.id}`}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                  aria-invalid={error && !name.trim() ? 'true' : 'false'}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`register-email-${event.id}`}>
                  Email
                </FieldLabel>
                <Input
                  id={`register-email-${event.id}`}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  disabled={isSubmitting}
                  aria-invalid={error && !email.trim() ? 'true' : 'false'}
                />
                <FieldDescription>
                  We&apos;ll use this to send you event updates and reminders.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor={`register-phone-${event.id}`}>
                  Phone Number
                </FieldLabel>
                <Input
                  id={`register-phone-${event.id}`}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number (optional)"
                  disabled={isSubmitting}
                />
                <FieldDescription>
                  Optional. Used for event-related communications.
                </FieldDescription>
              </Field>

              {error && <FieldError>{error}</FieldError>}
            </FieldGroup>
          </FieldSet>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registering...' : 'Register'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

