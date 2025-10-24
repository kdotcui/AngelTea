'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Home, Star, UtensilsCrossed, MapPin, Newspaper, ShoppingBag, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matchHash?: string | null;
};

export function BottomNav() {
  const pathname = usePathname();
  const [hash, setHash] = useState<string>('');
  const t = useTranslations();
  const isShopEnabled = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SHOP_ACCESS === 'true';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const update = () => setHash(window.location.hash || '');
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const items: NavItem[] = useMemo(() => {
    const base: NavItem[] = [
      { href: '/', label: 'Home', icon: Home, matchHash: '' },
      { href: '/#menu', label: t('navigation.popular'), icon: Star, matchHash: '#menu' },
      { href: '/#menu-boards', label: t('navigation.menu'), icon: UtensilsCrossed, matchHash: '#menu-boards' },
      { href: '/#visit', label: t('navigation.visit'), icon: MapPin, matchHash: '#visit' },
    ];
    const last: NavItem = isShopEnabled
      ? { href: '/shop', label: t('navigation.shop'), icon: ShoppingBag, matchHash: null }
      : { href: '/#press', label: t('navigation.press'), icon: Newspaper, matchHash: '#press' };
    return [...base, last];
  }, [isShopEnabled, t]);

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'md:hidden fixed inset-x-0 bottom-0 z-50 border-t',
        'bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/80'
      )}
    >
      <div className="mx-auto grid max-w-6xl grid-cols-5 items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const isOnHome = pathname === '/';
          const isActive =
            (item.href === '/' && isOnHome && (!hash || hash === '')) ||
            (isOnHome && item.matchHash && hash === item.matchHash) ||
            (item.href.startsWith('/shop') && pathname.startsWith('/shop'));

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-16 flex-col items-center justify-center gap-1.5 text-xs',
                'transition-colors',
                'hover:text-secondary',
                isActive ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Icon className="size-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Safe-area padding for iOS */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}

export default BottomNav;
