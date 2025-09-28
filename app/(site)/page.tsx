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
  CardFooter,
} from '@/components/ui/card';
import { Star, Quote, Newspaper } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import PopularDrinks from './PopularDrinks';

export default function Home() {
  return (
    <main className="min-h-[100vh] space-y-16 p-4 sm:space-y-24 sm:p-6 [--anchor-offset:5rem] [scroll-margin-top:var(--anchor-offset)]">
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/30 to-transparent p-6 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Image
              src="/angeltealogo.png"
              alt="Angel Tea logo"
              width={64}
              height={64}
              priority
              className="rounded-md"
            />
          </div>
          <Badge variant="secondary">Boba • Coffee • Tea</Badge>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            Angel Tea
          </h1>
          <p className="text-muted-foreground text-lg">
            To bring happiness, love, and growth every day through delicious
            meals and creative beverages.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button className="w-full sm:w-auto" asChild>
              <Link href="#menu">View Menu</Link>
            </Button>
            <Button className="w-full sm:w-auto" variant="outline" asChild>
              <Link href="#visit">Find Us</Link>
            </Button>
            <Button className="hidden sm:inline-flex" variant="ghost" asChild>
              <Link
                href="https://instagram.com/angelteaofficial"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&auto=format&fit=crop&w=1600"
              alt="Iced milk tea with tapioca pearls"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* Instagram removed per request */}

      {/* Featured Menu */}
      <section id="menu" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Popular Drinks</h2>
          <p className="text-muted-foreground">Classics and specialties.</p>
        </div>
        <PopularDrinks />
      </section>

      {/* Menu Boards (paired left/right) */}
      <section
        id="menu-boards"
        className="mx-auto max-w-6xl space-y-8 scroll-mt-24"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Menu Boards</h2>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="mb-3 text-lg font-medium">Drinks</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="overflow-hidden p-0">
                <img
                  src="/menu/drinksleft.webp"
                  alt="Drinks menu (left)"
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
              <Card className="overflow-hidden p-0">
                <img
                  src="/menu/drinksright.webp"
                  alt="Drinks menu (right)"
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-medium">Food</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="overflow-hidden p-0">
                <img
                  src="/menu/foodleft.webp"
                  alt="Food menu (left)"
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
              <Card className="overflow-hidden p-0">
                <img
                  src="/menu/foodright.webp"
                  alt="Food menu (right)"
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-lg font-medium">Desserts</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="overflow-hidden p-0">
                <img
                  src="/menu/dessertleft.webp"
                  alt="Dessert menu (left)"
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
              <Card className="overflow-hidden p-0">
                <img
                  src="/menu/dessertright.webp"
                  alt="Dessert menu (right)"
                  className="mx-auto block h-auto w-full max-w-[640px]"
                />
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* About / Story */}
      <section
        id="about"
        className="mx-auto grid max-w-6xl items-center gap-10 scroll-mt-24 md:grid-cols-2"
      >
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border shadow-sm">
            <Image
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&auto=format&fit=crop&w=1600"
              alt="Pouring milk into coffee"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p className="text-muted-foreground">
            Angel Tea is a highly rated cafe on Moody Street in Waltham, serving
            high-quality bubble tea, delicious desserts, and authentic homestyle
            Chinese food. We pride ourselves on fresh ingredients and creating
            drinks and dishes that bring people together.
          </p>
          <p className="text-muted-foreground">
            Founded in 2022 by owner Angel Zhao (Brandeis ’25), the cafe has
            quickly earned a loyal local following with a 4.7★ rating on Google.
            Our values of happiness and love guide everything we do.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Less Sugar</Badge>
            <Badge variant="outline">Non-Dairy Options</Badge>
            <Badge variant="outline">Locally Roasted</Badge>
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
            What guests say
          </h2>
          <p className="text-muted-foreground">Real love from our community.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            'I got one of their top 10 drinks, Mango Pomelo Sago Slush. It was amazing, really hit the spot from the first sip.',
            'Angel Tea offers a unique blend of exquisite tea selections and authentic Chinese dishes. The welcoming atmosphere and friendly staff make every visit feel special.',
            'Angel Tea maintains a 4.7 out of 5 star rating on Google, reflecting widespread customer satisfaction with its flavors and service.',
          ].map((quote, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-[--ring]/5 to-background"
            >
              <CardContent className="pt-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-secondary/30 px-3 py-1 text-xs font-medium text-secondary-foreground">
                  <Quote className="size-3" /> Guest review
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
                  <span>Verified guest</span>
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
            <CardTitle>Visit Angel Tea</CardTitle>
            <CardDescription>
              Open every day • 12:00 PM – 10:00 PM
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div>
              <p>331 Moody St</p>
              <p>Waltham, MA 02453</p>
              <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                <p>Street parking available; accessible spot nearby.</p>
                <p>
                  Wheelchair-accessible entrance and restroom; gender-neutral
                  restroom.
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
                    Google rating
                  </span>
                </div>
                <Button variant="outline" asChild>
                  <Link
                    href="https://www.google.com/maps/place/331+Moody+St,+Waltham,+MA+02453"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    See reviews
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
                    Get Directions
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
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <p className="text-muted-foreground">Answers to common questions.</p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {[
            {
              q: 'What are your hours of operation?',
              a: 'We are open every day from 12:00 PM to 10:00 PM.',
            },
            {
              q: 'Do you offer delivery or online ordering?',
              a: 'Yes, we offer takeout and dine-in, and delivery via DoorDash, Grubhub, and Uber Eats.',
            },
            {
              q: 'Is there parking available?',
              a: 'Street parking is available on Moody Street, with public lots nearby and an accessible spot close to the shop.',
            },
            {
              q: 'Are you wheelchair accessible?',
              a: 'Yes. Our entrance and restroom are wheelchair-accessible, and seating accommodates mobility devices.',
            },
            {
              q: 'Do you have non-dairy or vegan options?',
              a: 'Many fruit teas contain no dairy, and we have non-dairy alternatives for milk teas. Some food items are vegan-friendly.',
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
            In the Press
          </h2>
          <p className="text-muted-foreground">Stories about Angel Tea.</p>
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
                  Moody Street’s best bubble tea shop is run by a Brandeis
                  junior
                </Link>
              </CardTitle>
              <CardDescription>Oct 3, 2023</CardDescription>
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
                  This Brandeis College Student Is Running Her Own Boba Shop
                </Link>
              </CardTitle>
              <CardDescription>Aug 15, 2024</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </main>
  );
}
