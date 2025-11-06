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

function EventCard({ event }: { event: Event }) {
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

  const upcomingEvents = allEvents.filter(
    (event) => event.date >= today
  );
  const pastEvents = allEvents.filter((event) => event.date < today);

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
                <div className="grid gap-6 py-4 md:grid-cols-2">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
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
                    <EventCard key={event.id} event={event} />
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

