'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Event } from '@/types/event';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RegisterEventModal } from './RegisterEventModal';

interface EventCardProps {
  event: Event;
  status?: string; // Optional status like "Going fast" or "Almost full"
}

function formatEventDateTime(dateString: string, startTime?: string): string {
  const date = new Date(dateString);
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  
  let timeStr = '';
  if (startTime) {
    // Convert 24-hour format to 12-hour format if needed
    const [hours, minutes] = startTime.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    timeStr = ` • ${displayHour}:${minutes} ${ampm}`;
  }
  
  return `${dayOfWeek}, ${month} ${day}${timeStr}`;
}

export function EventCard({ event, status }: EventCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const priceDisplay = event.price === 0 ? 'Free' : `From $${event.price.toFixed(2)}`;

  return (
    <>
      <div className="flex flex-col h-full bg-gray-50 overflow-hidden rounded-xl shadow-sm border border-gray-200">
        {/* Image Section - rounded top corners only */}
        {event.imageUrl && (
          <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover rounded-t-xl"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        )}
        
        {/* Text Details Section */}
        <div className="bg-gray-50 p-3 flex flex-col gap-1.5">
          {/* Status Badge */}
          {status && (
            <Badge 
              className="w-fit text-white border-0 text-xs px-2 py-0.5 rounded-md font-normal"
              style={{ backgroundColor: '#e879f9' }}
            >
              {status}
            </Badge>
          )}
          
          {/* Event Title */}
          <h3 className="text-base font-bold text-gray-900 leading-tight">
            {event.title}
          </h3>
          
          {/* Date and Time */}
          <p className="text-sm text-gray-700">
            {formatEventDateTime(event.date, event.startTime)}
          </p>
          
          {/* Location */}
          {event.location && (
            <p className="text-sm text-gray-600">
              {event.location}
            </p>
          )}
          
          {/* Price */}
          <p className="text-sm font-bold text-gray-900">
            {priceDisplay}
          </p>

          {/* Register Button */}
          <div className="mt-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="w-full"
              size="sm"
            >
              Register
            </Button>
          </div>
        </div>
      </div>

      <RegisterEventModal
        event={event}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}

