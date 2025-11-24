'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VerificationResult {
  success: boolean;
  event?: {
    id: string;
    title: string;
    date: string;
  };
  attendee?: {
    name: string;
    email: string;
  };
  error?: string;
  alreadyRegistered?: boolean;
}

export default function EventRegistrationSuccessPage() {
  const [verificationStatus, setVerificationStatus] = useState<
    'loading' | 'success' | 'error'
  >('loading');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Retrieve payment link ID from sessionStorage
        if (typeof window === 'undefined') return;

        const paymentLinkId = sessionStorage.getItem('event_payment_link_id');
        const eventId = sessionStorage.getItem('event_id');

        if (!paymentLinkId) {
          setVerificationStatus('error');
          setErrorMessage(
            'Payment link ID not found. Please contact support if you completed payment.'
          );
          return;
        }

        // Call verification API
        const response = await fetch('/api/checkout/verify-event-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentLinkId }),
        });

        const data: VerificationResult = await response.json();

        if (!response.ok) {
          setVerificationStatus('error');
          setErrorMessage(
            data.error || 'Failed to verify payment. Please contact support.'
          );
          setResult(data);
          return;
        }

        // Success - clear sessionStorage
        sessionStorage.removeItem('event_payment_link_id');
        sessionStorage.removeItem('event_id');

        setVerificationStatus('success');
        setResult(data);
      } catch (error) {
        console.error('Error verifying payment:', error);
        setVerificationStatus('error');
        setErrorMessage(
          'An unexpected error occurred. Please contact support if you completed payment.'
        );
      }
    };

    verifyPayment();
  }, []);

  if (verificationStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6 flex justify-center">
            <Loader2 className="w-20 h-20 text-green-600 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Verifying Registration...
          </h1>
          <p className="text-gray-600">
            Please wait while we confirm your payment and complete your
            registration.
          </p>
        </div>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6 flex justify-center">
            <XCircle className="w-20 h-20 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Registration Issue
          </h1>
          <p className="text-gray-600 mb-8">
            {result?.alreadyRegistered
              ? 'You are already registered for this event.'
              : errorMessage ||
                'There was an issue completing your registration. Please contact support if you completed payment.'}
          </p>
          <div className="space-y-3">
            <Link href="/events" className="block">
              <Button className="w-full" size="lg">
                View Events
              </Button>
            </Link>
            <Link href="/" className="block">
              <Button variant="outline" className="w-full" size="lg">
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="w-20 h-20 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Registration Successful!
        </h1>
        {result?.event && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg text-left">
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Event Details:
            </p>
            <p className="text-base font-bold text-gray-900">
              {result.event.title}
            </p>
            {result.event.date && (
              <p className="text-sm text-gray-600 mt-1">
                Date: {new Date(result.event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            )}
            {result.attendee && (
              <p className="text-sm text-gray-600 mt-1">
                Registered as: {result.attendee.name}
              </p>
            )}
          </div>
        )}
        <p className="text-gray-600 mb-8">
          Thank you for registering! Your payment has been confirmed and you
          are now registered for this event. You will receive a confirmation
          email shortly.
        </p>
        <div className="space-y-3">
          <Link href="/events" className="block">
            <Button className="w-full" size="lg">
              View All Events
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="outline" className="w-full" size="lg">
              Go Home
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-6">
          Need help?{' '}
          <Link href="/contact" className="text-green-600 hover:underline">
            Contact us
          </Link>
        </p>
      </div>
    </div>
  );
}

