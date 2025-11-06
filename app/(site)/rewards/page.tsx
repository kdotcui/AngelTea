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
import { Gift, Star, TrendingUp, Zap, Coffee, Users, Check, Sparkles } from 'lucide-react';
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

      {/* Membership Plan */}
      <section id="membership" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">{t('rewards.membership.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.membership.description')}</p>
        </div>
        
        {/* Payment Options */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Annual Plan */}
          <Card className="overflow-hidden border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-background shadow-xl flex flex-col">
            <CardHeader className="pb-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-5 text-primary" />
                <CardTitle className="text-2xl">{t('rewards.membership.annual.plan_name')}</CardTitle>
              </div>
              <div className="text-left mt-4">
                <div className="text-4xl font-bold text-primary">
                  {t('rewards.membership.annual.annual_total')}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('rewards.membership.annual.savings')}
                </p>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full" size="lg" disabled>
                {t('rewards.membership.annual.join_button')}
              </Button>
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="overflow-hidden border-2 border-border bg-gradient-to-br from-muted/50 to-background shadow-lg flex flex-col">
            <CardHeader className="pb-4 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="size-5 text-muted-foreground" />
                <CardTitle className="text-2xl">{t('rewards.membership.monthly.plan_name')}</CardTitle>
              </div>
              <div className="text-left mt-4">
                <div className="text-4xl font-bold text-foreground">
                  {t('rewards.membership.monthly.monthly_price')}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <Button className="w-full" size="lg" variant="outline" disabled>
                {t('rewards.membership.monthly.join_button')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Membership Benefits Card */}
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="text-xl">{t('rewards.membership.shared_benefits_title')}</CardTitle>
            <CardDescription>
              {t('rewards.membership.billing_note')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Key Benefits */}
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  icon: Gift,
                  title: t('rewards.membership.benefit_free_drink.title'),
                  description: t('rewards.membership.benefit_free_drink.description'),
                  highlight: true,
                },
                {
                  icon: TrendingUp,
                  title: t('rewards.membership.benefit_points.title'),
                  description: t('rewards.membership.benefit_points.description'),
                  highlight: true,
                },
                {
                  icon: Star,
                  title: t('rewards.membership.benefit_pricing.title'),
                  description: t('rewards.membership.benefit_pricing.description'),
                },
                {
                  icon: Zap,
                  title: t('rewards.membership.benefit_exclusive.title'),
                  description: t('rewards.membership.benefit_exclusive.description'),
                },
              ].map((benefit, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 p-4 rounded-xl ${
                    benefit.highlight
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-background/50'
                  }`}
                >
                  <div className={`shrink-0 size-10 rounded-full flex items-center justify-center ${
                    benefit.highlight ? 'bg-primary/20' : 'bg-muted'
                  }`}>
                    <benefit.icon className={`size-5 ${
                      benefit.highlight ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* All Benefits List */}
            <div className="border-t pt-6">
              <h4 className="font-semibold mb-4">{t('rewards.membership.all_benefits_title')}</h4>
              <ul className="space-y-3">
                {[
                  t('rewards.membership.benefit_list.item_1'),
                  t('rewards.membership.benefit_list.item_2'),
                  t('rewards.membership.benefit_list.item_3'),
                  t('rewards.membership.benefit_list.item_4'),
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="size-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms */}
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground text-center">
                {t('rewards.membership.terms')}
              </p>
            </div>

            {/* Status Check */}
            <div className="flex flex-col gap-3">
              <Button className="w-full" variant="outline" size="lg" disabled>
                {t('rewards.chowbus.check_status')}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                {t('rewards.chowbus.coming_soon')}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Redeem Points */}
      <section id="redeem" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">{t('rewards.redeem.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.redeem.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-[--ring]/5 to-background">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/20 mx-auto">
                <Coffee className="size-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-2">
                {t('rewards.redeem.drink.points')}
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('rewards.redeem.drink.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('rewards.redeem.drink.description')}</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-accent/10 via-[--ring]/5 to-background">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-accent/20 mx-auto">
                <Star className="size-8 text-accent" />
              </div>
              <div className="text-3xl font-bold text-accent mb-2">
                {t('rewards.redeem.appetizer.points')}
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('rewards.redeem.appetizer.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('rewards.redeem.appetizer.description')}</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-secondary/20 bg-gradient-to-br from-secondary/10 via-[--ring]/5 to-background">
            <CardContent className="pt-6 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary/20 mx-auto">
                <Gift className="size-8 text-secondary-foreground" />
              </div>
              <div className="text-3xl font-bold text-secondary-foreground mb-2">
                {t('rewards.redeem.shirt.points')}
              </div>
              <h3 className="text-lg font-semibold mb-2">{t('rewards.redeem.shirt.title')}</h3>
              <p className="text-sm text-muted-foreground">{t('rewards.redeem.shirt.description')}</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How Points Work */}
      <section id="points" className="mx-auto max-w-6xl space-y-8 scroll-mt-24">
        <div className="space-y-2 text-center">
          <h2 className="text-2xl font-semibold">{t('rewards.points.title')}</h2>
          <p className="text-muted-foreground">{t('rewards.points.description')}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-[--ring]/5 to-background">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <Coffee className="size-5 text-primary" />
                <CardTitle>{t('rewards.points.member.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('rewards.points.member.description')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.points.member.purchase')}</span>
                  <Badge variant="secondary" className="font-bold">2× {t('rewards.points_label')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.points.member.free_drink')}</span>
                  <Badge variant="secondary" className="font-bold">{t('rewards.points.member.monthly')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-accent/20 bg-gradient-to-br from-accent/10 via-[--ring]/5 to-background">
            <CardHeader>
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp className="size-5 text-accent" />
                <CardTitle>{t('rewards.points.guest.title')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                {t('rewards.points.guest.description')}
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.points.guest.purchase')}</span>
                  <Badge variant="secondary">1× {t('rewards.points_label')}</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <span className="text-sm">{t('rewards.points.guest.bonus')}</span>
                  <Badge variant="secondary">{t('rewards.points.guest.available')}</Badge>
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

