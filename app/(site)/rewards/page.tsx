import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Gift, Star, TrendingUp, Zap, Coffee, Users } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export default async function RewardsPage() {
  const t = await getTranslations();

  return (
    <main className="min-h-[100vh] space-y-16 p-4 sm:space-y-24 sm:p-6 [--anchor-offset:5rem] [scroll-margin-top:var(--anchor-offset)]">
      {/* Hero Section */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 rounded-2xl bg-gradient-to-br from-primary/30 via-accent/30 to-transparent p-6 md:grid-cols-2">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/20 p-3">
              <Gift className="size-8 text-primary" />
            </div>
            <Badge variant="secondary">{t('rewards.badge')}</Badge>
          </div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl">
            {t('rewards.title')}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t('rewards.description')}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" size="lg" asChild>
              <Link href="#join">
                {t('rewards.join_now')}
              </Link>
            </Button>
            <Button className="w-full sm:w-auto" variant="outline" size="lg" asChild>
              <Link href="#how-it-works">
                {t('rewards.learn_more')}
              </Link>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border shadow-sm">
            <Image
              src="/storieangeltea.png"
              alt={t('rewards.alt_hero')}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">{t('rewards.how_it_works.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.how_it_works.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Coffee,
              title: t('rewards.how_it_works.step_1.title'),
              description: t('rewards.how_it_works.step_1.description'),
            },
            {
              icon: Star,
              title: t('rewards.how_it_works.step_2.title'),
              description: t('rewards.how_it_works.step_2.description'),
            },
            {
              icon: Gift,
              title: t('rewards.how_it_works.step_3.title'),
              description: t('rewards.how_it_works.step_3.description'),
            },
          ].map((step, idx) => (
            <Card
              key={idx}
              className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-[--ring]/5 to-background"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-primary/20">
                  <step.icon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Chowbus Integration */}
      <section id="join" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <Card className="border-accent/30 bg-gradient-to-br from-accent/10 to-background">
          <CardHeader>
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-full bg-accent/20 p-2">
                <TrendingUp className="size-6 text-accent" />
              </div>
              <CardTitle className="text-2xl">{t('rewards.chowbus.title')}</CardTitle>
            </div>
            <CardDescription className="text-base">
              {t('rewards.chowbus.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-semibold">{t('rewards.chowbus.benefits.title')}</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 size-4 text-primary shrink-0" />
                    {t('rewards.chowbus.benefits.item_1')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 size-4 text-primary shrink-0" />
                    {t('rewards.chowbus.benefits.item_2')}
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 size-4 text-primary shrink-0" />
                    {t('rewards.chowbus.benefits.item_3')}
                  </li>
                </ul>
              </div>
              <div className="relative overflow-hidden rounded-xl border">
                <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Users className="size-12 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      {t('rewards.chowbus.placeholder')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button className="w-full sm:w-auto" size="lg" disabled>
                {t('rewards.chowbus.join_button')}
              </Button>
              <Button className="w-full sm:w-auto" variant="outline" size="lg" disabled>
                {t('rewards.chowbus.check_status')}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('rewards.chowbus.coming_soon')}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Rewards Tiers */}
      <section id="tiers" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">{t('rewards.tiers.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.tiers.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: t('rewards.tiers.bronze.name'),
              points: t('rewards.tiers.bronze.points'),
              benefits: [
                t('rewards.tiers.bronze.benefit_1'),
                t('rewards.tiers.bronze.benefit_2'),
              ],
              color: 'from-orange-500/20 to-orange-600/10',
              borderColor: 'border-orange-500/30',
            },
            {
              name: t('rewards.tiers.silver.name'),
              points: t('rewards.tiers.silver.points'),
              benefits: [
                t('rewards.tiers.silver.benefit_1'),
                t('rewards.tiers.silver.benefit_2'),
                t('rewards.tiers.silver.benefit_3'),
              ],
              color: 'from-gray-400/20 to-gray-500/10',
              borderColor: 'border-gray-400/30',
            },
            {
              name: t('rewards.tiers.gold.name'),
              points: t('rewards.tiers.gold.points'),
              benefits: [
                t('rewards.tiers.gold.benefit_1'),
                t('rewards.tiers.gold.benefit_2'),
                t('rewards.tiers.gold.benefit_3'),
                t('rewards.tiers.gold.benefit_4'),
              ],
              color: 'from-yellow-500/20 to-yellow-600/10',
              borderColor: 'border-yellow-500/30',
            },
          ].map((tier, idx) => (
            <Card
              key={idx}
              className={`overflow-hidden bg-gradient-to-br ${tier.color} ${tier.borderColor}`}
            >
              <CardHeader>
                <CardTitle className="text-xl">{tier.name}</CardTitle>
                <CardDescription className="text-base font-medium text-foreground">
                  {tier.points}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Star className="mt-0.5 size-4 text-primary shrink-0 fill-primary" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Earning Points */}
      <section id="earning" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t('rewards.earning.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.earning.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-[--ring]/5 to-background">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Coffee className="size-5 text-primary" />
                <CardTitle>{t('rewards.earning.in_store.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('rewards.earning.in_store.description')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.earning.in_store.purchase')}</span>
                  <Badge variant="secondary">+10 {t('rewards.points')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.earning.in_store.review')}</span>
                  <Badge variant="secondary">+5 {t('rewards.points')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.earning.in_store.referral')}</span>
                  <Badge variant="secondary">+25 {t('rewards.points')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-accent/10 via-[--ring]/5 to-background">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-5 text-accent" />
                <CardTitle>{t('rewards.earning.online.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('rewards.earning.online.description')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.earning.online.order')}</span>
                  <Badge variant="secondary">+15 {t('rewards.points')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.earning.online.first_order')}</span>
                  <Badge variant="secondary">+50 {t('rewards.points')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.earning.online.birthday')}</span>
                  <Badge variant="secondary">+100 {t('rewards.points')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Menu Preview */}
      <section id="menu-preview" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">{t('rewards.menu_preview.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.menu_preview.description')}</p>
        </div>
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
        <div className="flex justify-center">
          <Button variant="outline" asChild>
            <Link href="/#menu-boards">{t('rewards.view_full_menu')}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

