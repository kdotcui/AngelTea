'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { getSession, clearSession } from '@/services/auth';
import { GameSession } from '@/types/auth';
import { Button } from '@/components/ui/button';

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isShopEnabled = process.env.NEXT_PUBLIC_SHOP_ACCESS === 'true';
  const t = useTranslations();
  const [session, setSession] = useState<GameSession | null>(null);

  useEffect(() => {
    const updateSession = () => {
      const currentSession = getSession();
      setSession(currentSession);
    };

    // Initial load
    updateSession();

    // Listen for session changes
    window.addEventListener('gameSessionChange', updateSession);

    return () => {
      window.removeEventListener('gameSessionChange', updateSession);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    window.location.reload(); // Refresh to update game pages
  };
  return (
    <div>
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/angeltealogo.png"
              alt={t('hero.alt_logo')}
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="text-sm font-semibold">{t('hero.title')}</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            <Link href="/#menu" className="hover:text-secondary">
              {t('navigation.popular')}
            </Link>
            <Link href="/#menu-boards" className="hover:text-secondary">
              {t('navigation.menu')}
            </Link>
            <Link href="/events" className="hover:text-secondary">
              Events
            </Link>
            {isShopEnabled && (
              <Link href="/shop" className="hover:text-secondary">
                {t('navigation.shop')}
              </Link>
            )}
            <details className="relative group">
              <summary className="cursor-pointer hover:text-secondary list-none flex items-center gap-1">
                Minigames
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="absolute left-0 mt-2 w-48 bg-white border rounded-md shadow-lg py-1 hidden group-open:block z-50">
                <Link href="/plinko" className="block px-4 py-2 hover:bg-gray-100" onClick={(e) => {
                  const details = e.currentTarget.closest('details');
                  if (details) details.removeAttribute('open');
                }}>
                  Plinko
                </Link>
                <Link href="/mines" className="block px-4 py-2 hover:bg-gray-100" onClick={(e) => {
                  const details = e.currentTarget.closest('details');
                  if (details) details.removeAttribute('open');
                }}>
                  Mines
                </Link>
                <Link href="/personality-quiz" className="block px-4 py-2 hover:bg-gray-100" onClick={(e) => {
                  const details = e.currentTarget.closest('details');
                  if (details) details.removeAttribute('open');
                }}>
                  Personality Quiz
                </Link>
              </div>
            </details>
            <Link href="/rewards" className="hover:text-secondary">
              {t('navigation.rewards')}
            </Link>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="tel:+17817905313"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              {t('common.call_us')}
            </a>
            {session && (
              <div className="ml-2 flex items-center gap-2">
                <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium">
                  {session.email.charAt(0).toUpperCase()}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            )}
          </div>
          <details className="md:hidden">
            <summary className="select-none rounded-md border px-3 py-1.5 text-sm">
              {t('common.menu')}
            </summary>
            <div className="absolute left-0 right-0 mt-2 border-b bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur dark:bg-background/95">
              <div className="mx-auto max-w-6xl">
                <div className="grid gap-3">
                  <Link href="/#menu" className="hover:underline">
                    {t('navigation.popular')}
                  </Link>
                  <Link href="/#menu-boards" className="hover:underline">
                    {t('navigation.menu')}
                  </Link>
                  <Link href="/events" className="hover:underline">
                    Events
                  </Link>
                  {isShopEnabled && (
                    <Link href="/shop" className="hover:underline">
                      {t('navigation.shop')}
                    </Link>
                  )}
                  <details className="group">
                    <summary className="cursor-pointer hover:underline list-none flex items-center gap-1">
                      Minigames
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="ml-4 mt-2 grid gap-2">
                      <Link href="/plinko" className="hover:underline">
                        Plinko
                      </Link>
                      <Link href="/mines" className="hover:underline">
                        Mines
                      </Link>
                      <Link href="/personality-quiz" className="hover:underline">
                        Personality Quiz
                      </Link>
                    </div>
                  </details>
                  <Link href="/rewards" className="hover:underline">
                    {t('navigation.rewards')}
                  </Link>
                  <div className="grid gap-3 pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <LanguageSwitcher />
                      <a
                        href="tel:+17817905313"
                        className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary"
                      >
                        {t('common.call_us')}
                      </a>
                    </div>
                    {session && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className="inline-flex size-7 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium">
                          {session.email.charAt(0).toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-600">{session.email}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleLogout}
                          className="ml-auto"
                        >
                          Logout
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </details>
        </div>
      </header>
      {children}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl p-6 text-sm">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <a className="hover:underline" href="tel:+17817905313">
              (+1) 781-790-5313
            </a>
            <a className="hover:underline" href="tel:+18572079709">
              (+1) 857-207-9709
            </a>
            <a className="hover:underline" href="mailto:angeltea331@gmail.com">
              angeltea331@gmail.com
            </a>
          </div>
          <p className="text-muted-foreground mt-2">
            Open everyday 12:00-10:00PM • 331 Moody St., Waltham, MA, 02453
          </p>
        </div>
      </footer>
    </div>
  );
}
