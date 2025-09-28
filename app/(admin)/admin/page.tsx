'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function AdminDashboard() {
  return (
    <main className="mx-auto min-h-[80vh] max-w-6xl space-y-8 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="text-muted-foreground">Manage content and settings.</p>
        </div>
        <Button asChild>
          <Link href="/">Back to site</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Menu</CardTitle>
            <CardDescription>
              Add or update drinks, food, and desserts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled>
              New Item
            </Button>
            <Button variant="outline" disabled>
              Edit Items
            </Button>
            <Button variant="outline" disabled>
              Upload Images
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Promotions</CardTitle>
            <CardDescription>
              Feature seasonal drinks and banners.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled>
              New Promo
            </Button>
            <Button variant="outline" disabled>
              Schedule Promo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours & Info</CardTitle>
            <CardDescription>
              Update business hours and contact info.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled>
              Edit Hours
            </Button>
            <Button variant="outline" disabled>
              Edit Footer
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reviews & Press</CardTitle>
            <CardDescription>
              Manage testimonials and press mentions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" disabled>
              Add Testimonial
            </Button>
            <Button variant="outline" disabled>
              Add Press Link
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Placeholder dashboard. Hook up actions to Firebase or your API when
          ready.
        </p>
        <Button variant="ghost" asChild>
          <Link href="/api/hello">Test API</Link>
        </Button>
      </div>
    </main>
  );
}
