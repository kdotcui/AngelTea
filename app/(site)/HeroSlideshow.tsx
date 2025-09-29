'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { listHeroSlides } from '@/services/heroSlides';
import type { HeroSlide } from '@/types/hero';
import { useLanguage } from '@/lib/LanguageContext';

export default function HeroSlideshow() {
  const { t } = useLanguage();
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    listHeroSlides()
      .then((s) => setSlides(s))
      .catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, 4000);
    return () => clearInterval(id);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const current = slides[idx];

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border shadow-sm">
      {slides.map((s, i) => (
        <div
          key={s.id ?? i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={s.imageUrl}
            alt={s.title ?? 'Hero'}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={i === idx}
          />
          {s.href ? (
            <a
              href={s.href}
              className="absolute inset-0"
              aria-label={t('common.open_link')}
            />
          ) : null}
        </div>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`${t('common.go_to_slide')} ${i + 1}`}
            onClick={() => setIdx(i)}
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              i === idx ? 'bg-primary' : 'bg-white/70 border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
