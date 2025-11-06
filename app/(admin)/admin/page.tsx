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
  CardAction,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { listPopularDrinks } from '@/services/popularDrinks';
import { listHeroSlides } from '@/services/heroSlides';
import { getShopItems } from '@/services/shopItemUtils';
import { listEvents } from '@/services/events';
import HeroSlideActions from './HeroSlideActions';
import type { HeroSlide } from '@/types/hero';
import EditDrinkButton from './EditDrinkButton';
import DeleteDrinkButton from './DeleteDrinkButton';
import EditShopItemButton from './shopItems/EditShopItemButton';
import AddShopItemButton from './shopItems/AddShopItemButton';
import EditEventButton from './EditEventButton';
import DeleteEventButton from './DeleteEventButton';
import AddEventButton from './AddEventButton';
import type { PopularDrink } from '@/types/drink';
import type { ShopItem } from '@/types/shop';
import type { Event } from '@/types/event';

export default function AdminDashboard() {
  const [drinks, setDrinks] = useState<PopularDrink[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    const data = await listPopularDrinks();
    setDrinks(data);
    const heroes = await listHeroSlides();
    setHeroSlides(heroes);
    const items = await getShopItems();
    setShopItems(items);
    const eventsData = await listEvents();
    setEvents(eventsData);
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

      <div className="grid gap-6">
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
                        <Image
                          src={s.imageUrl}
                          alt={s.title ?? 'Hero'}
                          fill
                          className="object-cover"
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Events ({events.length})</CardTitle>
          <CardDescription>
            Manage upcoming and past events.
          </CardDescription>
          <CardAction>
            <AddEventButton onAdded={refresh} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border">
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-muted">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-muted-foreground text-sm">
                      {new Date(event.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                      {event.startTime && event.endTime && ` • ${event.startTime} - ${event.endTime}`}
                      {event.startTime && !event.endTime && ` • ${event.startTime}`}
                      {!event.startTime && event.endTime && ` • until ${event.endTime}`}
                    </div>
                    <div className="text-sm font-semibold mt-1">
                      ${event.price.toFixed(2)}
                    </div>
                    {event.location && (
                      <div className="text-muted-foreground text-sm mt-1">
                        {event.location}
                      </div>
                    )}
                    {event.description && (
                      <div className="text-muted-foreground text-sm line-clamp-2 mt-1">
                        {event.description}
                      </div>
                    )}
                    <div className="mt-3 flex gap-2">
                      <EditEventButton event={event} onSaved={refresh} />
                      <DeleteEventButton eventId={event.id!} onDeleted={refresh} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Popular Drinks ({drinks.length})</CardTitle>
          <CardDescription>
            Content shown on the homepage Popular Drinks section.
          </CardDescription>
          <CardAction>
            <Button variant="outline" asChild>
              <Link href="/admin/upload/popular-drink">Add Drink</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : drinks.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No items yet.</p>
              <Button size="sm" asChild>
                <Link href="/admin/upload/popular-drink">Add first item</Link>
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
      <Card>
        <CardHeader>
          <CardTitle>Shop Merchandise ({shopItems.length})</CardTitle>
          <CardDescription>
            Products available in the shop.
          </CardDescription>
          <CardAction>
            <AddShopItemButton onAdded={refresh} />
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : shopItems.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">No items yet.</p>
              <AddShopItemButton onAdded={refresh} />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shopItems.map((item) => (
                <div key={item.id} className="rounded-xl border">
                  <div className="relative h-36 w-full overflow-hidden rounded-t-xl bg-muted">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={item.images[0]}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)} • {item.quantity} in stock
                    </div>
                    {item.description && (
                      <div className="text-muted-foreground text-sm line-clamp-2 mt-1">
                        {item.description}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      {item.total_reviews} reviews ({item.review_score.toFixed(1)}/5) • {item.purchases} sold
                    </div>
                    <div className="mt-3 flex gap-2">
                      <EditShopItemButton item={item} onSaved={refresh} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>


      <Separator />
    </main>
  );
}
