import type { Metadata } from "next"
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { requireRole } from "@/lib/session"
import { serverApiFetch } from "@/lib/server-api"
import { Badge } from "@/components/ui/badge"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { UpgradeButton } from "@/components/dashboard/upgrade-button"
import { FREE_PLAN_ITEM_LIMIT } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { PremiumState } from "@/types/dashboard"

export const metadata: Metadata = { title: "Premium" }

const BENEFITS = [
  "Unlimited menu items (Free is capped at 3)",
  "Featured placement at the top of the home page",
  "Premium badge on every card and detail page",
  "One payment, lifetime access — no renewals",
]

export default async function VendorSubscriptionPage() {
  const user = await requireRole("vendor")

  let state: PremiumState | null = null
  try {
    const response = await serverApiFetch<PremiumState>("/payment/subscription")
    state = response.data ?? null
  } catch {
    state = null
  }

  const priceCents = state?.priceCents ?? 9999
  const premium = state?.premiumActive ?? user.subscriptionPlan === "premium"

  return (
    <div className="max-w-4xl">
      <DashboardPageHeader
        title="Premium"
        description="One lifetime upgrade for vendors. Premium is activated only after Stripe confirms the payment."
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Free</h2>
            {!premium && <Badge variant="secondary">Current plan</Badge>}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Up to {FREE_PLAN_ITEM_LIMIT} pending or approved items.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>Standard menu listing</li>
            <li>Order management</li>
            <li>No featured placement</li>
          </ul>
        </div>

        <div className="rounded-xl border border-brand/50 bg-gradient-to-br from-brand/15 via-card to-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg">Premium</h2>
            {premium ? (
              <Badge>Active</Badge>
            ) : (
              <Badge variant="outline">Lifetime</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatCurrency(priceCents / 100)} once — no renewals, no expiry.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {BENEFITS.map((benefit) => (
              <li key={benefit} className="flex items-start gap-2">
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="mt-0.5 size-4 shrink-0 text-brand"
                />
                <span className="text-muted-foreground">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6">
            {premium ? (
              <p className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                Premium is active on this account. Every item limit is lifted.
              </p>
            ) : (
              <>
                <UpgradeButton className="w-full" />
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Premium activates from the Stripe webhook, not the success
                  page.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
