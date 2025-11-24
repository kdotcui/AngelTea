import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { listEvents, addAttendeeToEvent } from '@/services/events';
import { Attendee } from '@/types/event';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentLinkId }: { paymentLinkId: string } = body;

    if (!paymentLinkId) {
      return NextResponse.json(
        { error: 'Payment link ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the payment link to get metadata
    const paymentLink = await stripe.paymentLinks.retrieve(paymentLinkId);

    if (!paymentLink) {
      return NextResponse.json(
        { error: 'Payment link not found' },
        { status: 404 }
      );
    }

    // Extract metadata from payment link
    const eventId = paymentLink.metadata?.event_id;
    const attendeeName = paymentLink.metadata?.attendee_name;
    const attendeeEmail = paymentLink.metadata?.attendee_email;
    const attendeePhone = paymentLink.metadata?.attendee_phone;

    if (!eventId || !attendeeName || !attendeeEmail) {
      return NextResponse.json(
        { error: 'Invalid payment link metadata' },
        { status: 400 }
      );
    }

    // Retrieve all checkout sessions for this payment link
    // We need to find the most recent completed session
    const sessions = await stripe.checkout.sessions.list({
      payment_link: paymentLinkId,
      limit: 10,
    });

    // Filter for completed sessions with paid status, sorted by creation date (most recent first)
    const completedSessions = sessions.data
      .filter(
        (session) =>
          session.payment_status === 'paid' &&
          session.status === 'complete'
      )
      .sort((a, b) => (b.created || 0) - (a.created || 0));

    if (completedSessions.length === 0) {
      return NextResponse.json(
        { error: 'Payment not found or not completed' },
        { status: 400 }
      );
    }

    // Use the most recent completed session
    const completedSession = completedSessions[0];

    // Verify the session was created recently (within last hour) to prevent replay attacks
    const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
    if (completedSession.created && completedSession.created < oneHourAgo) {
      return NextResponse.json(
        { error: 'Payment session is too old. Please contact support.' },
        { status: 400 }
      );
    }

    // Additional security: Verify the customer email matches the attendee email
    if (
      completedSession.customer_details?.email &&
      completedSession.customer_details.email.toLowerCase() !==
        attendeeEmail.toLowerCase()
    ) {
      return NextResponse.json(
        { error: 'Email mismatch. Please contact support.' },
        { status: 400 }
      );
    }

    // Verify the event still exists
    const events = await listEvents();
    const event = events.find((e) => e.id === eventId);

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if attendee already registered (prevent duplicates)
    const existingAttendees = event.attendees || [];
    const emailExists = existingAttendees.some(
      (a) => a.email.toLowerCase() === attendeeEmail.toLowerCase()
    );

    if (emailExists) {
      return NextResponse.json(
        {
          error: 'This email is already registered for this event',
          alreadyRegistered: true,
        },
        { status: 400 }
      );
    }

    // Create attendee object
    const attendee: Attendee = {
      name: attendeeName,
      email: attendeeEmail.toLowerCase(),
      ...(attendeePhone && { phone: attendeePhone }),
    };

    // Register attendee to event
    await addAttendeeToEvent(eventId, attendee);

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        title: event.title,
        date: event.date,
      },
      attendee: {
        name: attendee.name,
        email: attendee.email,
      },
    });
  } catch (error: unknown) {
    console.error('Error verifying event payment:', error);

    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode || 500 }
      );
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to verify payment';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

