"use client";

import {useEffect, useRef, useState, useTransition} from 'react';
import {useLocale} from 'next-intl';
import {usePathname, useRouter} from '@/navigation';
import {useSearchParams} from 'next/navigation';
import {Button} from '@/components/ui/button';
import {Globe} from 'lucide-react';

type LanguageOption = {
  code: 'en' | 'zh' | 'es';
  name: string;
};

const languages: LanguageOption[] = [
  {code: 'en', name: 'English'},
  {code: 'zh', name: '中文'},
  {code: 'es', name: 'Español'},
];

export function LocaleSwitcher() {
  const locale = useLocale() as LanguageOption['code'];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const changeLocale = (nextLocale: LanguageOption['code']) => {
    setOpen(false);
    if (nextLocale === locale) return;

    const query = Object.fromEntries(searchParams.entries());
    startTransition(() => {
      router.replace({pathname, query}, {locale: nextLocale});
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language"
        disabled={isPending}
      >
        <Globe className="h-4 w-4" />
      </Button>
      {open ? (
        <div
          role="menu"
          aria-label="Select language"
          className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-md border bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
        >
          {languages.map((lang) => {
            const isActive = lang.code === locale;
            return (
              <button
                key={lang.code}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                className={`block w-full px-3 py-2 text-left text-sm transition hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                  isActive ? 'font-medium text-primary' : 'text-neutral-700 dark:text-neutral-200'
                }`}
                onClick={() => changeLocale(lang.code)}
              >
                {lang.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
