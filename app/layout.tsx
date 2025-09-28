import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Poppins, Roboto, Pacifico } from 'next/font/google';
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
              <Link href="#menu" className="hover:text-secondary">
                Popular
              </Link>
              <Link href="#menu-boards" className="hover:text-secondary">
                Menu
              </Link>
              <Link href="#about" className="hover:text-secondary">
                About
              </Link>
              <Link href="#visit" className="hover:text-secondary">
                Visit
              </Link>
              <Link href="#press" className="hover:text-secondary">
                Press
              </Link>
            </nav>
            <div className="hidden sm:block">
              <a
                href="tel:+17817905313"
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-secondary"
              >
                Call us
              </a>
            </div>
            {/* Mobile menu */}
            <details className="md:hidden">
              <summary className="select-none rounded-md border px-3 py-1.5 text-sm">
                Menu
              </summary>
              <div className="absolute left-0 right-0 mt-2 border-b bg-white/95 px-4 py-3 text-sm shadow-sm backdrop-blur dark:bg-background/95">
                <div className="mx-auto max-w-6xl">
                  <div className="grid gap-3">
                    <Link href="#menu" className="hover:underline">
                      Popular
                    </Link>
                    <Link href="#menu-boards" className="hover:underline">
                      Menu
                    </Link>
                    <Link href="#about" className="hover:underline">
                      About
                    </Link>
                    <Link href="#visit" className="hover:underline">
                      Visit
                    </Link>
                    <Link href="#press" className="hover:underline">
                      Press
                    </Link>
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
              <a
                className="hover:underline"
                href="mailto:angeltea331@gmail.com"
              >
                angeltea331@gmail.com
              </a>
            </div>
            <p className="text-muted-foreground mt-2">
              Open everyday 12:00-10:00PM • 331 Moody St., Waltham, MA, 02453
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
