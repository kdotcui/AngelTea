import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { listEvents } from '@/services/events';
import { Attendee } from '@/types/event';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, attendee }: { eventId: string; attendee: Attendee } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!attendee || !attendee.name || !attendee.email) {
      return NextResponse.json(
        { error: 'Attendee name and email are required' },
        { status: 400 }
      );
    }

    // Fetch events to validate event exists and get server-side price
    const events = await listEvents();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Validate event is paid
    if (event.price <= 0) {
      return NextResponse.json(
        { error: 'This event is free and does not require payment' },
        { status: 400 }
      );
    }

    // Check if email already exists in attendees
    const existingAttendees = event.attendees || [];
    const emailExists = existingAttendees.some(
      (a) => a.email.toLowerCase() === attendee.email.trim().toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        { error: 'This email is already registered for this event' },
        { status: 400 }
      );
    }

    // Create line item for event registration
    const lineItems: Stripe.PaymentLinkCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(event.price * 100), // Convert to cents
          product_data: {
            name: `Event Registration: ${event.title}`,
            description: `Registration for ${event.title}${event.date ? ` on ${event.date}` : ''}`,
            ...(event.imageUrl && {
              images: [event.imageUrl],
            }),
            metadata: {
              event_id: eventId,
              attendee_name: attendee.name.trim(),
              attendee_email: attendee.email.trim().toLowerCase(),
              ...(attendee.phone && { attendee_phone: attendee.phone.trim() }),
            },
          },
        },
      },
    ];

    // Create the payment link
    const paymentLink = await stripe.paymentLinks.create({
      line_items: lineItems,
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${req.nextUrl.origin}/checkout/event-success`,
        },
      },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      // Metadata on payment link level for easy retrieval
      metadata: {
        event_id: eventId,
        attendee_name: attendee.name.trim(),
        attendee_email: attendee.email.trim().toLowerCase(),
        ...(attendee.phone && { attendee_phone: attendee.phone.trim() }),
        registration_date: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      url: paymentLink.url,
      id: paymentLink.id,
    });
  } catch (error: unknown) {
    console.error('Error creating event payment link:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to create payment link';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

