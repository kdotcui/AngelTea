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
import HeroSlideActions from './HeroSlideActions';
import type { HeroSlide } from '@/types/hero';
import EditDrinkButton from './EditDrinkButton';
import DeleteDrinkButton from './DeleteDrinkButton';
import type { PopularDrink } from '@/types/drink';
import { useLanguage } from '@/lib/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();
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
          <h1 className="text-3xl font-bold">{t('admin.title')}</h1>
          <p className="text-muted-foreground">{t('admin.description')}</p>
        </div>
        <Button asChild>
          <Link href="/">{t('common.back_to_site')}</Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.hero_slideshow.title')}</CardTitle>
            <CardDescription>{t('admin.hero_slideshow.description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {heroSlides.length} {t('admin.hero_slideshow.slides_count')}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <Link href="/admin/upload/hero">{t('admin.hero_slideshow.add_slide')}</Link>
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
                        {s.title || t('admin.hero_slideshow.untitled')}
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
              <p className="text-sm text-muted-foreground">{t('admin.hero_slideshow.no_slides')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.popular_drinks.title')} ({drinks.length})</CardTitle>
          <CardDescription>
            {t('admin.popular_drinks.description')}
          </CardDescription>
          <CardAction>
            <Button variant="outline" asChild>
              <Link href="/admin/upload/popular-drink">{t('admin.popular_drinks.add_drink')}</Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
          ) : drinks.length === 0 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t('admin.popular_drinks.no_items')}</p>
              <Button size="sm" asChild>
                <Link href="/admin/upload/popular-drink">{t('admin.popular_drinks.add_first_item')}</Link>
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
    </main>
  );
}
