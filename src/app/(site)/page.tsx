import type { ComponentProps } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowUpRightIcon,
  CheckmarkBadge01Icon,
  CreditCardIcon,
  DeliveryTruck01Icon,
  ShieldCheckIcon,
} from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CategoryTile } from "@/components/menu/category-tile"
import { MenuItemCard } from "@/components/menu/menu-item-card"
import { Hero } from "@/components/home/hero"
import { CATEGORIES } from "@/lib/constants"
import { fetchPublicApi } from "@/lib/api-url"
import type { MenuItem } from "@/types"

export const metadata: Metadata = {
  title: "PizzaHub — Hot. Fresh. Pizza.",
  description:
    "Browse approved pizzas from local kitchens. Order, track, and enjoy.",
}

type MenuFiltersData = {
  categories: Array<{ value: string; count: number }>
  locations: Array<{ value: string; count: number }>
}

type IconName = ComponentProps<typeof HugeiconsIcon>["icon"]

const BENEFITS: Array<{ title: string; description: string; icon: IconName }> = [
  {
    title: "Approved kitchens",
    description:
      "Every vendor and every menu item is reviewed by an admin before it goes live.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Premium placement",
    description:
      "Premium vendors appear first in featured picks and carry a Premium badge.",
    icon: CheckmarkBadge01Icon,
  },
  {
    title: "Track your order",
    description:
      "Follow each order from pending to accepted, and see exactly where it stands.",
    icon: DeliveryTruck01Icon,
  },
  {
    title: "One-time premium upgrade",
    description:
      "Vendors unlock unlimited menu items with a single, secure Stripe payment.",
    icon: CreditCardIcon,
  },
]

const STEPS = [
  {
    number: "01",
    title: "Browse the menu",
    description:
      "Search, filter by category or location, and sort by price to find your pizza.",
  },
  {
    number: "02",
    title: "Place your order",
    description:
      "Pick a delivery date and address, then send the order to that kitchen.",
  },
  {
    number: "03",
    title: "Track the status",
    description:
      "The vendor accepts or rejects it. You can cancel while it is still pending.",
  },
]

export default async function Home() {
  const [featured, filters] = await Promise.all([
    fetchPublicApi<MenuItem[]>("/menu/featured"),
    fetchPublicApi<MenuFiltersData>("/menu/filters"),
  ])

  const featuredItems = featured ?? []
  const categories =
    filters?.categories && filters.categories.length > 0
      ? filters.categories
      : CATEGORIES.map((value) => ({ value, count: 0 }))

  return (
    <>
      <Hero />

      {/* Featured — premium vendors first (server ordering), 8 items max. */}
      <section className="border-y border-border/60 bg-surface/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4 lg:mb-14">
            <div>
              <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">
                Featured Menu Items
              </h2>
              <p className="mt-3 text-muted-foreground">
                Premium kitchens first, then the newest approved pizzas.
              </p>
            </div>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:text-brand"
            >
              View all
              <HugeiconsIcon icon={ArrowUpRightIcon} className="size-4" />
            </Link>
          </div>

          {featuredItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item) => (
                <MenuItemCard key={item.id} item={item} featured />
              ))}
            </div>
          ) : (
            <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
              <p className="text-base font-medium">No featured items yet</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Featured picks appear once kitchens are approved and publish
                their menu items. Browse the full menu in the meantime.
              </p>
              <Link
                href="/menu"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "mt-2",
                })}
              >
                Browse Menu
              </Link>
            </Card>
          )}
        </div>
      </section>

      {/* Categories — all six assignment categories, equal tiles. */}
      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 lg:mb-14">
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">
              Pizza Categories
            </h2>
            <p className="mt-3 text-muted-foreground">
              Pick a style and jump straight into the matching menu.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((category) => (
              <CategoryTile key={category.value} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose PizzaHub */}
      <section className="border-y border-border/60 bg-surface/40 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-10 max-w-2xl lg:mb-14">
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">
              Why Choose PizzaHub?
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              A marketplace built around review, clear status, and honest
              pricing — no surprise fees at checkout.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <Card key={benefit.title} className="h-full gap-3 p-6">
                <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
                  <HugeiconsIcon icon={benefit.icon} className="size-5" />
                </span>
                <h3 className="text-base font-semibold">{benefit.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="mx-auto max-w-[1240px]">
          <h2 className="mb-12 font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight lg:mb-16">
            How It Works
          </h2>
          <ol className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {STEPS.map((step) => (
              <li key={step.number} className="border-t border-border pt-6">
                <span className="font-display text-sm text-brand">
                  {step.number}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
        <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-6 rounded-2xl bg-brand p-8 text-brand-foreground sm:flex-row sm:items-center sm:justify-between lg:p-12">
          <div>
            <h2 className="font-display text-[clamp(1.75rem,4vw,2.75rem)] leading-none">
              Ready for great pizza?
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-brand-foreground/80 sm:text-base">
              Browse approved kitchens, place your first order, and follow it
              through to acceptance.
            </p>
          </div>
          <Button
            size="lg"
            className="w-full shrink-0 bg-brand-foreground text-brand hover:bg-brand-foreground/90 sm:w-auto"
            render={<Link href="/menu" />}
          >
            Browse Menu
            <HugeiconsIcon icon={ArrowUpRightIcon} className="size-4" />
          </Button>
        </div>
      </section>
    </>
  )
}
