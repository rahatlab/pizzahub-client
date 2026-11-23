import type { Metadata } from "next"
import Link from "next/link"
import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  CheckmarkCircle02Icon,
  Pizza01Icon,
  ShoppingBag01Icon,
  TruckDeliveryIcon,
} from "@hugeicons/core-free-icons"
import { requireRole } from "@/lib/session"
import { serverApiFetch } from "@/lib/server-api"
import { Button } from "@/components/ui/button"
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders"
import {
  CategoryLegend,
  ItemsCategoryChart,
  OrdersStatusChart,
} from "@/components/dashboard/overview-charts"
import type { VendorDashboard } from "@/types/dashboard"

export const metadata: Metadata = { title: "Vendor Overview" }

export default async function VendorOverviewPage() {
  const user = await requireRole("vendor")

  let data: VendorDashboard | null = null
  let failed = false
  try {
    const response = await serverApiFetch<VendorDashboard>("/dashboard/vendor")
    data = response.data ?? null
  } catch {
    failed = true
  }

  const addItemAction = (
    <Button size="sm" render={<Link href="/dashboard/vendor/add-item" />}>
      <HugeiconsIcon icon={Add01Icon} className="size-4" />
      Add item
    </Button>
  )

  if (!data) {
    return (
      <div>
        <DashboardPageHeader
          title={`Welcome, ${user.name.split(" ")[0] || "Chef"}`}
          description="Live counts from your kitchen."
          action={addItemAction}
        />
        <DashboardEmptyState
          icon={TruckDeliveryIcon}
          title={failed ? "Dashboard data unavailable" : "No data yet"}
          description={
            failed
              ? "The API did not respond. Refresh once the server is reachable."
              : "Publish your first menu item to start receiving orders."
          }
        />
      </div>
    )
  }

  const { stats } = data

  const cards: Array<{
    label: string
    value: number
    hint: string
    icon: ComponentProps<typeof HugeiconsIcon>["icon"]
    accent?: boolean
  }> = [
    { label: "Total items", value: stats.totalItems, hint: "All statuses", icon: Pizza01Icon },
    {
      label: "Active items",
      value: stats.activeItems,
      hint: "Approved and orderable",
      icon: CheckmarkCircle02Icon,
    },
    {
      label: "Pending items",
      value: stats.pendingItems,
      hint: "Awaiting admin review",
      icon: ShoppingBag01Icon,
    },
    {
      label: "Pending orders",
      value: stats.pendingOrders,
      hint: "Waiting for your action",
      icon: TruckDeliveryIcon,
      accent: stats.pendingOrders > 0,
    },
    {
      label: "Accepted orders",
      value: stats.acceptedOrders,
      hint: `${stats.totalOrders} orders total`,
      icon: CheckmarkCircle02Icon,
    },
  ]

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={`Welcome, ${user.name.split(" ")[0] || "Chef"}`}
        description={
          user.subscriptionPlan === "premium"
            ? "Premium kitchen — unlimited items and featured placement."
            : "Free plan — up to 3 active menu items."
        }
        action={addItemAction}
      />

      {stats.pendingItems > 0 && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
          {stats.pendingItems} item{stats.pendingItems === 1 ? "" : "s"} awaiting
          admin review. They become orderable once approved.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Orders by status</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Every order placed with your kitchen.
          </p>
          <OrdersStatusChart data={data.ordersByStatus} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Items by category</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Across all statuses.
          </p>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_170px]">
            <ItemsCategoryChart data={data.itemsByCategory} />
            <CategoryLegend data={data.itemsByCategory} />
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link
            href="/dashboard/vendor/orders"
            className="text-xs font-medium text-brand hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentOrdersTable orders={data.recentOrders} showCustomer />
      </section>
    </div>
  )
}
