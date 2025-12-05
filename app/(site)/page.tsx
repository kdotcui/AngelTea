import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Star, Quote, Newspaper, InstagramIcon, Mic } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PopularDrinks from './PopularDrinks';
import HeroSlideshow from './HeroSlideshow';
import { getTranslations } from 'next-intl/server';
import VoiceOrderingSection from './VoiceOrderingSection';

export default async function Home() {
  const t = await getTranslations();
  return (
    <main className="min-h-[100vh] space-y-16 p-4 sm:space-y-24 sm:p-6 [--anchor-offset:5rem] [scroll-margin-top:var(--anchor-offset)]">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/30 to-transparent p-6 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Image
              src="/angeltealogo.png"
              alt={t('hero.alt_logo')}
              width={64}
              height={64}
              priority
              className="rounded-md"
            />
          </div>
          <Badge variant="secondary">{t('hero.badge')}</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('hero.description')}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button className="w-full sm:w-auto" asChild>
              <Link href="/#menu">{t('common.view_menu')}</Link>
            </Button>
            <Button className="w-full sm:w-auto" variant="outline" asChild>
              <Link href="/#visit">{t('common.find_us')}</Link>
            </Button>
            <Button
              className="hidden sm:inline-flex"
              variant="ghost"
              size="icon"
              asChild
              aria-label="Instagram"
            >
              <Link
                href="https://instagram.com/angelteaofficial"
                target="_blank"
                rel="noopener noreferrer"
              >
                <InstagramIcon />
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <HeroSlideshow />
        </div>
      </section>

      {/* Instagram removed per request */}

      {/* Featured Menu */}
      <section id="menu" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t('menu.popular_drinks')}</h2>
          <p className="text-muted-foreground">{t('menu.popular_drinks_description')}</p>
        </div>
        <PopularDrinks />
      </section>

      {/* Menu Boards (paired left/right) */}
      <section
        id="menu-boards"
        className="mx-auto max-w-6xl space-y-8 scroll-mt-24"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t('menu.menu_boards')}</h2>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-lg font-medium">{t('menu.drinks')}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="overflow-hidden p-0">
                <Image
                  src="/menu/drinksleft.webp"
                  alt={t('menu.drinks_left_alt')}
                  width={640}
                  height={640}
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
              <Card className="overflow-hidden p-0">
                <Image
                  src="/menu/drinksright.webp"
                  alt={t('menu.drinks_right_alt')}
                  width={640}
                  height={640}
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-medium">{t('menu.food')}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="overflow-hidden p-0">
                <Image
                  src="/menu/foodleft.webp"
                  alt={t('menu.food_left_alt')}
                  width={640}
                  height={640}
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
              <Card className="overflow-hidden p-0">
                <Image
                  src="/menu/foodright.webp"
                  alt={t('menu.food_right_alt')}
                  width={640}
                  height={640}
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-medium">{t('menu.desserts')}</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="overflow-hidden p-0">
                <Image
                  src="/menu/dessertleft.webp"
                  alt={t('menu.dessert_left_alt')}
                  width={640}
                  height={640}
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
              <Card className="overflow-hidden p-0">
                <Image
                  src="/menu/dessertright.webp"
                  alt={t('menu.dessert_right_alt')}
                  width={640}
                  height={640}
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Ordering */}
      <VoiceOrderingSection />

      {/* About / Story */}
      <section
        id="about"
        className="mx-auto grid max-w-6xl items-center gap-10 scroll-mt-24 md:grid-cols-2"
      >
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border shadow-sm">
            <Image
              src="/storieangeltea.png"
              alt={t('about.alt_image')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">{t('about.title')}</h2>
          <p className="text-muted-foreground">
            {t('about.description_1')}
          </p>
          <p className="text-muted-foreground">
            {t('about.description_2')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{t('about.badges.less_sugar')}</Badge>
            <Badge variant="outline">{t('about.badges.non_dairy')}</Badge>
            <Badge variant="outline">{t('about.badges.locally_roasted')}</Badge>
          </div>
        </div>
      </section>

      {/* Testimonials / Reviews */}
      <section id="testimonials" className="mx-auto max-w-6xl space-y-8">
        <div className="space-y-2">
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-decorative)' }}
          >
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground">{t('testimonials.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            t('testimonials.quote_1'),
            t('testimonials.quote_2'),
            t('testimonials.quote_3'),
          ].map((quote, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-[--ring]/5 to-background"
            >
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/30 px-3 py-1 text-xs font-medium text-secondary-foreground">
                  <Quote className="size-3" /> {t('common.guest_review')}
                </div>
                <p className="text-balance italic">“{quote}”</p>
                <Separator className="my-4" />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-3 text-yellow-500"
                        fill="currentColor"
                      />
                    ))}
                  </div>
                  <span>{t('common.verified_guest')}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Visit / Hours & Contact */}
      <section id="visit" className="mx-auto max-w-6xl scroll-mt-24">
        <Card>
          <CardHeader>
            <CardTitle>{t('visit.title')}</CardTitle>
            <CardDescription>
              {t('visit.hours')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <p>{t('visit.address_line_1')}</p>
              <p>{t('visit.address_line_2')}</p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>{t('visit.parking_info')}</p>
                <p>
                  {t('visit.accessibility_info')}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <div className="relative w-full overflow-hidden rounded-xl border shadow-sm max-w-full md:w-[420px]">
                <iframe
                  src="https://www.google.com/maps?q=331+Moody+St,+Waltham,+MA+02453&output=embed"
                  loading="lazy"
                  className="h-64 w-full"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="flex w-full flex-col items-start gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between md:w-[420px]">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Star
                        key={i}
                        className="size-4 text-yellow-500"
                        fill="currentColor"
                      />
                    ))}
                    <Star
                      className="size-4 text-yellow-500/30"
                      fill="currentColor"
                    />
                  </div>
                  <span className="text-sm font-medium">4.7</span>
                  <span className="text-muted-foreground text-sm">
                    {t('visit.google_rating')}
                  </span>
                </div>
                <Button variant="outline" asChild>
                  <Link
                    href="https://www.google.com/maps/place/331+Moody+St,+Waltham,+MA+02453"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('common.see_reviews')}
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <Button className="w-full sm:w-auto" asChild>
                  <Link
                    href="https://maps.google.com/?q=331+Moody+St,+Waltham,+MA+02453"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('common.get_directions')}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* FAQs */}
      <section id="faqs" className="mx-auto max-w-6xl space-y-6 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t('faqs.title')}</h2>
          <p className="text-muted-foreground">{t('faqs.description')}</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: t('faqs.questions.hours.q'),
              a: t('faqs.questions.hours.a'),
            },
            {
              q: t('faqs.questions.delivery.q'),
              a: t('faqs.questions.delivery.a'),
            },
            {
              q: t('faqs.questions.parking.q'),
              a: t('faqs.questions.parking.a'),
            },
            {
              q: t('faqs.questions.accessibility.q'),
              a: t('faqs.questions.accessibility.a'),
            },
            {
              q: t('faqs.questions.dietary.q'),
              a: t('faqs.questions.dietary.a'),
            },
          ].map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Press Mentions */}
      <section id="press" className="mx-auto max-w-6xl space-y-6 scroll-mt-24">
        <div className="space-y-2">
          <h2
            className="text-2xl font-semibold"
            style={{ fontFamily: 'var(--font-decorative)' }}
          >
            {t('press.title')}
          </h2>
          <p className="text-muted-foreground">{t('press.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-background">
            <CardHeader>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Newspaper className="size-3" /> The Justice
              </div>
              <CardTitle>
                <Link
                  href="https://www.thejustice.org/article/2023/10/moody-streets-best-bubble-tea-shop-is-run-by-a-brandeis-junior"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary"
                >
                  {t('press.justice.title')}
                </Link>
              </CardTitle>
              <CardDescription>{t('press.justice.date')}</CardDescription>
            </CardHeader>
          </Card>
          <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-background">
            <CardHeader>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                <Newspaper className="size-3" /> Spoon University
              </div>
              <CardTitle>
                <Link
                  href="https://spoonuniversity.com/lifestyle/this-brandeis-college-student-is-running-her-own-boba-shop"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-secondary"
                >
                  {t('press.spoon.title')}
                </Link>
              </CardTitle>
              <CardDescription>{t('press.spoon.date')}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  );
}
