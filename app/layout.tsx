import type { Metadata } from 'next';
import { Poppins, Roboto, Pacifico } from 'next/font/google';
import { AnalyticsInit } from './AnalyticsInit';
import './globals.css';

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

export const metadata: Metadata = {
  title: {
    default:
      'Angel Tea | Bubble Tea, Desserts & Homestyle Chinese Food – Waltham, MA',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} ${roboto.variable} ${pacifico.variable} antialiased`}
      >
        {children}
        <AnalyticsInit />
      </body>
    </html>
  );
}
