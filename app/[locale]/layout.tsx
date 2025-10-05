import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Poppins, Roboto, Pacifico } from 'next/font/google';
import { AnalyticsInit } from '../AnalyticsInit';
import { locales } from '@/i18n/routing';

const poppins = Poppins({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const roboto = Roboto({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  weight: ['400', '500', '700'],
});

const pacifico = Pacifico({
  variable: '--font-decorative',
  subsets: ['latin'],
  weight: '400',
});

const metadataTitle =
  'Angel Tea | Bubble Tea, Desserts & Homestyle Chinese Food – Waltham, MA';

export const metadata: Metadata = {
  title: {
    default: metadataTitle,
    template: '%s | Angel Tea',
  },
  description:
    'Angel Tea on Moody Street serves creative bubble tea, desserts, and authentic homestyle Chinese food. Open daily 12–10 PM.',
  keywords: [
    'Angel Tea Waltham',
    'bubble tea Waltham',
    'boba tea shop near Boston',
    'Moody Street restaurants',
    'Chinese food in Waltham',
  ],
  authors: [{ name: 'Angel Tea' }],
  icons: {
    icon: '/angeltealogo.png',
    apple: '/angeltealogo.png',
    shortcut: '/angeltealogo.png',
  },
  openGraph: {
    siteName: 'Angel Tea',
    title: 'Angel Tea – Bubble Tea & Chinese Food in Waltham',
    description:
      'Creative drinks and homestyle Chinese food on Moody Street. Open daily 12–10 PM.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Angel Tea – Moody Street, Waltham',
    description:
      'Bubble tea, desserts, and homestyle Chinese food. Open daily 12–10 PM.',
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!locales.includes(locale as (typeof locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <body
        className={`${poppins.variable} ${roboto.variable} ${pacifico.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
        <AnalyticsInit />
      </body>
    </html>
  );
}
