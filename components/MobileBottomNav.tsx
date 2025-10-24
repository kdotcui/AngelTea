"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Utensils, Sparkles, ShoppingBag, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    href: '/',
    icon: Home,
    label: 'Home',
  },
  {
    href: '/#menu',
    icon: Utensils,
    label: 'Menu',
  },
  {
    href: '/personality-quiz',
    icon: Sparkles,
    label: 'Quiz',
  },
  {
    href: '/shop',
    icon: ShoppingBag,
    label: 'Shop',
  },
  {
    href: 'tel:+17817905313',
    icon: Phone,
    label: 'Call',
    external: true,
  },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const isShopEnabled = process.env.NEXT_PUBLIC_SHOP_ACCESS === 'true';

  // Filter out shop if not enabled, and adjust layout if needed
  const filteredNavItems = navItems.filter(
    (item) => item.href !== '/shop' || isShopEnabled
  );

  // Adjust grid columns based on number of items
  const gridCols = filteredNavItems.length === 5 ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-white/95 backdrop-blur-lg shadow-lg supports-[backdrop-filter]:bg-white/80 dark:bg-background/95 pb-safe">
      <div className="mx-auto max-w-screen-xl">
        <div className={cn('grid h-16 items-center justify-items-center px-2', gridCols)}>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = 
              item.href === '/'
                ? pathname === '/'
                : pathname?.startsWith(item.href.split('#')[0]) && item.href !== '/';

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10 active:scale-95',
                    'min-w-[60px] w-full'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      'text-muted-foreground hover:text-primary'
                    )}
                  />
                  <span
                    className={cn(
                      'text-[10px] font-medium transition-colors',
                      'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 transition-all duration-200 hover:bg-primary/10 active:scale-95',
                  'min-w-[60px] w-full',
                  isActive && 'bg-primary/5'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-primary'
                  )}
                />
                <span
                  className={cn(
                    'text-[10px] font-medium transition-colors',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
