'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
import { listPopularDrinks } from '@/services/popularDrinks';
import { listHeroSlides } from '@/services/heroSlides';
import HeroSlideActions from './HeroSlideActions';
import type { HeroSlide } from '@/types/hero';
import EditDrinkButton from './EditDrinkButton';
import DeleteDrinkButton from './DeleteDrinkButton';
import type { PopularDrink } from '@/types/drink';

export default function AdminDashboard() {
  const [drinks, setDrinks] = useState<PopularDrink[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    const data = await listPopularDrinks();
    setDrinks(data);
    const heroes = await listHeroSlides();
    setHeroSlides(heroes);
  }
  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

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
            <CardTitle>Hero Slideshow</CardTitle>
            <CardDescription>Manage rotating hero images.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {heroSlides.length} slides
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/upload/hero">Add Slide</Link>
                </Button>
              </div>
            </div>
            {heroSlides.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {heroSlides.map((s, i) => (
                  <div
                    key={s.id ?? i}
                    className="overflow-hidden rounded-xl border"
                  >
                    <div className="relative h-32 w-full bg-muted">
                      {s.imageUrl ? (
                        <img
                          src={s.imageUrl}
                          alt={s.title ?? 'Hero'}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="p-3 text-sm">
                      <div className="font-medium">
                        {typeof s.order === 'number' ? `#${s.order} ` : ''}
                        {s.title || 'Untitled'}
                      </div>
                      {s.href ? (
                        <div className="text-muted-foreground truncate">
                          {s.href}
                        </div>
                      ) : null}
                      <div className="mt-2">
                        <HeroSlideActions slide={s} onChanged={refresh} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No slides yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Drinks</CardTitle>
            <CardDescription>
              Add or update drinks featured on the homepage.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="outline" asChild>
              <Link href="/admin/upload/popular-drink">Add Drink</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Drinks ({drinks.length})</CardTitle>
          <CardDescription>
            Content shown on the homepage Popular Drinks section.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : drinks.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No items yet.</p>
              <Button size="sm" asChild>
                <Link href="/admin/upload">Add first item</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {drinks.map((d) => (
                <div key={d.id} className="rounded-xl border">
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-muted">
                    {d.imageUrl ? (
                      <Image
                        src={d.imageUrl}
                        alt={d.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <div className="font-medium">{d.title}</div>
                    <div className="text-muted-foreground text-sm line-clamp-2">
                      {d.description}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <EditDrinkButton drink={d} onSaved={refresh} />
                      <DeleteDrinkButton drinkId={d.id!} onDeleted={refresh} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
