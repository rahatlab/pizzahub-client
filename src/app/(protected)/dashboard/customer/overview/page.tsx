import type { Metadata } from "next"
import Link from "next/link"
import {
  CheckmarkCircle02Icon,
  ClockIcon,
  Pizza01Icon,
  ShoppingBag01Icon,
  CancelCircleIcon,
} from "@hugeicons/core-free-icons"
import { requireRole } from "@/lib/session"
import { serverApiFetch } from "@/lib/server-api"
import { buttonVariants } from "@/components/ui/button"
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import { RecentOrdersTable } from "@/components/dashboard/recent-orders"
import type { CustomerDashboard } from "@/types/dashboard"

export const metadata: Metadata = { title: "Customer Overview" }

export default async function CustomerOverviewPage() {
  const user = await requireRole("customer")

  let data: CustomerDashboard | null = null
  try {
    const response = await serverApiFetch<CustomerDashboard>("/dashboard/customer")
    data = response.data ?? null
  } catch {
    data = null
  }

  const browseAction = (
    <Link href="/menu" className={buttonVariants({ size: "sm" })}>
      Browse menu
    </Link>
  )

  if (!data) {
    return (
      <div>
        <DashboardPageHeader
          title={`Hey, ${user.name.split(" ")[0] || "there"}`}
          description="Your order history at a glance."
        />
        <DashboardEmptyState
          icon={Pizza01Icon}
          title="Dashboard data unavailable"
          description="The API did not respond. Refresh once the server is reachable."
          action={browseAction}
        />
      </div>
    )
  }

  const { stats } = data

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title={`Hey, ${user.name.split(" ")[0] || "there"}`}
        description="Track every order you place, from pending to accepted."
        action={browseAction}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          label="Total orders"
          value={stats.totalOrders}
          hint="All time"
          icon={ShoppingBag01Icon}
        />
        <StatCard
          label="Pending"
          value={stats.pending}
          hint="Awaiting the kitchen"
          icon={ClockIcon}
          accent={stats.pending > 0}
        />
        <StatCard
          label="Accepted"
          value={stats.accepted}
          hint="Confirmed by vendor"
          icon={CheckmarkCircle02Icon}
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          hint="Declined by vendor"
          icon={CancelCircleIcon}
        />
        <StatCard
          label="Cancelled"
          value={stats.cancelled}
          hint="Cancelled by you"
          icon={CancelCircleIcon}
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold">Recent orders</h2>
          <Link
            href="/dashboard/customer/my-orders"
            className="text-xs font-medium text-brand hover:underline"
          >
            View all
          </Link>
        </div>
        <RecentOrdersTable orders={data.recentOrders} />
      </section>
    </div>
  )
}
