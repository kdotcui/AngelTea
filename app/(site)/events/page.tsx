import { listEvents } from '@/services/events';
import { Event } from '@/types/event';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { EventCard } from '@/components/EventCard';

function formatEventDate(dateString: string, startTime?: string, endTime?: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const formattedDate = date.toLocaleDateString('en-US', options);
  if (startTime && endTime) {
    return `${formattedDate} ${startTime} - ${endTime}`;
  } else if (startTime) {
    return `${formattedDate} at ${startTime}`;
  } else if (endTime) {
    return `${formattedDate} until ${endTime}`;
  }
  return formattedDate;
}

function LegacyEventCard({ event }: { event: Event }) {
  return (
    <Card>
      {event.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-t-xl">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle>{event.title}</CardTitle>
        <CardDescription>
          {formatEventDate(event.date, event.startTime, event.endTime)}
          {event.location && ` • ${event.location}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-2">
          <span className="text-lg font-semibold">${event.price.toFixed(2)}</span>
        </div>
        {event.description && (
          <p className="text-muted-foreground">{event.description}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default async function EventsPage() {
  const allEvents = await listEvents();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  const upcomingEvents = allEvents
    .filter((event) => event.date >= today)
    .sort((a, b) => {
      // Sort by date ascending (most soon first)
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      // If same date, sort by startTime if available
      if (a.startTime && b.startTime) {
        return a.startTime.localeCompare(b.startTime);
      }
      return 0;
    });
  const pastEvents = allEvents.filter((event) => event.date < today);

  // Get the first 3 upcoming events for the featured layout
  const featuredEvents = upcomingEvents.slice(0, 3);
  const remainingEvents = upcomingEvents.slice(3);

  return (
    <main className="min-h-[100vh] space-y-8 p-4 sm:p-6">
      <section className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground">
            Discover upcoming and past events at Angel Tea
          </p>
        </div>

        <Accordion type="multiple" defaultValue={["upcoming"]} className="w-full">
          <AccordionItem value="upcoming">
            <AccordionTrigger>Upcoming Events</AccordionTrigger>
            <AccordionContent>
              {upcomingEvents.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No upcoming events scheduled.
                </p>
              ) : (
                <div className="py-4 space-y-6">
                  {/* Featured Events Layout: First event on left (1/2 width), next 2 on right stacked */}
                  {featuredEvents.length > 0 && (
                    <div className="flex gap-4 h-[500px]">
                      {/* First event - takes 1/2 width on left */}
                      {featuredEvents[0] && (
                        <div className="w-1/2 h-full">
                          <EventCard event={featuredEvents[0]} />
                        </div>
                      )}
                      
                      {/* Second and third events - stacked vertically on right */}
                      {featuredEvents.length > 1 && (
                        <div className="w-1/2 flex flex-col gap-4 h-full">
                          {featuredEvents[1] && (
                            <div className="flex-1 h-1/2 min-h-0">
                              <EventCard event={featuredEvents[1]} />
                            </div>
                          )}
                          {featuredEvents[2] && (
                            <div className="flex-1 h-1/2 min-h-0">
                              <EventCard event={featuredEvents[2]} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Remaining events in grid layout */}
                  {remainingEvents.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2">
                      {remainingEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="past">
            <AccordionTrigger>Past Events</AccordionTrigger>
            <AccordionContent>
              {pastEvents.length === 0 ? (
                <p className="text-muted-foreground py-4">
                  No past events to display.
                </p>
              ) : (
                <div className="grid gap-6 py-4 md:grid-cols-2">
                  {pastEvents.map((event) => (
                    <LegacyEventCard key={event.id} event={event} />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>
    </main>
  );
}

