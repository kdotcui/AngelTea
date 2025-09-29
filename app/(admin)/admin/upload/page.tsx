'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function UploadHubPage() {
  return (
    <main className="mx-auto min-h-[80vh] max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Hero Slideshow</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href="/admin/upload/hero">Add Slide</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Popular Drink</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button asChild variant="outline">
                  <Link href="/admin/upload/popular-drink">Add Drink</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
