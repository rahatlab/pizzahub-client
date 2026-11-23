import type { Metadata } from "next"
import Link from "next/link"
import { requireRole } from "@/lib/session"
import { serverApiFetch } from "@/lib/server-api"
import { buttonVariants } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { MenuItemForm } from "@/components/dashboard/menu-item-form"
import { FREE_PLAN_ITEM_LIMIT } from "@/lib/constants"
import type { MenuItem, SubscriptionPlan } from "@/types"

export const metadata: Metadata = { title: "Add Menu Item" }

async function loadUsage(): Promise<{
  counted: number
  plan: SubscriptionPlan
} | null> {
  try {
    const response = await serverApiFetch<MenuItem[]>("/menu/vendor/me?limit=50")
    const items = response.data ?? []
    return {
      counted: items.filter(
        (item) => item.status === "pending" || item.status === "approved"
      ).length,
      plan: "free",
    }
  } catch {
    return null
  }
}

export default async function AddMenuItemPage() {
  const user = await requireRole("vendor")
  const usage = await loadUsage()

  const plan = user.subscriptionPlan
  const counted = usage?.counted ?? 0
  const atLimit = plan !== "premium" && counted >= FREE_PLAN_ITEM_LIMIT

  return (
    <div className="max-w-3xl">
      <DashboardPageHeader
        title="Add menu item"
        description="Upload up to 5 photos, set a price, and submit for admin review."
      />

      {atLimit ? (
        <div className="rounded-xl border border-brand/40 bg-brand/5 p-5">
          <p className="text-sm font-semibold">Free plan limit reached</p>
          <p className="mt-1 text-sm text-muted-foreground">
            The Free plan allows {FREE_PLAN_ITEM_LIMIT} pending or approved
            items. Deactivate or delete an item, or upgrade for unlimited items.
          </p>
          <Link
            href="/dashboard/vendor/subscription"
            className={buttonVariants({ size: "sm", className: "mt-4" })}
          >
            Upgrade to Premium
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-5 rounded-xl border border-border bg-surface/60 px-4 py-3 text-sm text-muted-foreground">
            {counted}/{plan === "premium" ? "∞" : FREE_PLAN_ITEM_LIMIT} counted
            items · new items stay <strong>pending</strong> until an admin
            approves them.
          </div>
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <MenuItemForm />
          </div>
        </>
      )}
    </div>
  )
}
