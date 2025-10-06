import Link from 'next/link';
import Image from 'next/image';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { getTranslations } from 'next-intl/server';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations();
  const isShopEnabled = process.env.NEXT_PUBLIC_SHOP_ACCESS === 'true';
  return (
    <div>
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/angeltealogo.png"
              alt="Angel Tea logo"
              width={28}
              height={28}
              className="rounded-sm"
            />
            <span className="text-sm font-semibold">Angel Tea</span>
          </Link>
          <nav className="hidden items-center gap-5 text-sm md:flex">
            {isShopEnabled && (
              <Link href="/shop" className="hover:text-secondary">
                {t('navigation.shop')}
              </Link>
            )}
            <Link href="/#menu" className="hover:text-secondary">
              {t('navigation.popular')}
            </Link>
            <Link href="/#menu-boards" className="hover:text-secondary">
              {t('navigation.menu')}
            </Link>
            <Link href="/#about" className="hover:text-secondary">
              {t('navigation.about')}
            </Link>
            <Link href="/#visit" className="hover:text-secondary">
              {t('navigation.visit')}
            </Link>
            <Link href="/#press" className="hover:text-secondary">
              {t('navigation.press')}
            </Link>
          </nav>
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />
            <a
              href="tel:+17817905313"
              className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              {t('common.call_us')}
            </a>
          </div>
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <details>
              <summary className="select-none rounded-md border px-3 py-1.5 text-sm">
                {t('common.menu')}
              </summary>
              <div className="absolute left-0 right-0 mt-2 border-b bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur dark:bg-background/95">
                <div className="mx-auto max-w-6xl">
                  <div className="grid gap-3">
                    {isShopEnabled && (
                      <Link href="/shop" className="hover:underline">
                        {t('navigation.shop')}
                      </Link>
                    )}
                    <Link href="/#menu" className="hover:underline">
                      {t('navigation.popular')}
                    </Link>
                    <Link href="/#menu-boards" className="hover:underline">
                      {t('navigation.menu')}
                    </Link>
                    <Link href="/#about" className="hover:underline">
                      {t('navigation.about')}
                    </Link>
                    <Link href="/#visit" className="hover:underline">
                      {t('navigation.visit')}
                    </Link>
                    <Link href="/#press" className="hover:underline">
                      {t('navigation.press')}
                    </Link>
                  </div>
                </div>
              </div>
            </details>
          </div>
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
            {t('footer.hours')}
          </p>
        </div>
      </footer>
    </div>
  );
}
