'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { type PopularDrink } from '@/types/drink';
import { listPopularDrinks } from '@/services/popularDrinks';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';

export default function PopularDrinks() {
  const [items, setItems] = useState<PopularDrink[]>([]);
  const t = useTranslations('popularDrinks');

  useEffect(() => {
    listPopularDrinks()
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  if (!items.length) return null;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((d) => (
        <HoverCard key={d.id} openDelay={100} closeDelay={100}>
          <Dialog>
            <HoverCardTrigger asChild>
              <div>
                <Card className="overflow-hidden pt-0 pb-6">
                  <div className="relative h-72 sm:h-80 lg:h-96 w-full bg-muted">
                    <DialogTrigger asChild>
                      <button className="absolute inset-0">
                        {d.imageUrl ? (
                          <Image
                            src={d.imageUrl}
                            alt={d.title}
                            fill
                            className="object-cover object-top"
                            sizes="(max-width: 1024px) 100vw, 33vw"
                          />
                        ) : null}
                      </button>
                    </DialogTrigger>
                  </div>
                  <CardHeader className="flex-row items-center justify-between">
                    <div>
                      <DialogTrigger asChild>
                        <button className="text-left">
                          <CardTitle>{d.title}</CardTitle>
                          <CardDescription>{d.description}</CardDescription>
                        </button>
                      </DialogTrigger>
                    </div>
                    <div className="flex items-center gap-2">
                      {Array.isArray(d.sizes) && d.sizes?.length ? (
                        <Badge>
                          {d.sizes
                            .map((s) => `${s.label} $${s.price.toFixed(2)}`)
                            .join(' · ')}
                        </Badge>
                      ) : typeof d.price === 'number' ? (
                        <Badge>${d.price.toFixed(2)}</Badge>
                      ) : null}
                    </div>
                  </CardHeader>
                </Card>
              </div>
            </HoverCardTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{d.title}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {d.videoUrl ? (
                  <video
                    className="w-full rounded-lg"
                    src={d.videoUrl}
                    controls
                    preload="metadata"
                  />
                ) : null}
                {d.story ? (
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {d.story}
                  </p>
                ) : null}
              </div>
            </DialogContent>
          </Dialog>
          <HoverCardContent className="w-80 text-sm">
            <div className="font-medium">{d.title}</div>
            <div className="text-muted-foreground">{d.description}</div>
            {d.story ? (
              <p className="mt-2 line-clamp-5 whitespace-pre-wrap">{d.story}</p>
            ) : (
              <p className="mt-2 text-muted-foreground">{t('clickForStory')}</p>
            )}
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
