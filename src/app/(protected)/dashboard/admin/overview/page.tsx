import type { Metadata } from "next"
import Link from "next/link"
import {
  CheckmarkCircle02Icon,
  Invoice01Icon,
  Pizza01Icon,
  TruckDeliveryIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { requireRole } from "@/lib/session"
import { serverApiFetch } from "@/lib/server-api"
import { buttonVariants } from "@/components/ui/button"
import {
  DashboardEmptyState,
  DashboardPageHeader,
} from "@/components/dashboard/dashboard-shell"
import { StatCard } from "@/components/dashboard/stat-card"
import {
  CategoryLegend,
  ItemsCategoryChart,
  OrdersStatusChart,
} from "@/components/dashboard/overview-charts"
import type { AdminDashboard } from "@/types/dashboard"

export const metadata: Metadata = { title: "Admin Overview" }

export default async function AdminOverviewPage() {
  await requireRole("admin")

  let data: AdminDashboard | null = null
  try {
    const response = await serverApiFetch<AdminDashboard>("/dashboard/admin")
    data = response.data ?? null
  } catch {
    data = null
  }

  if (!data) {
    return (
      <div>
        <DashboardPageHeader title="Platform control" />
        <DashboardEmptyState
          title="Dashboard data unavailable"
          description="The API did not respond. Refresh once the server is reachable."
          action={
            <Link
              href="/dashboard/admin/users"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Open users
            </Link>
          }
        />
      </div>
    )
  }

  const { stats } = data

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Platform control"
        description="Approvals, accounts, and Premium revenue at a glance."
        action={
          <Link
            href="/dashboard/admin/menu-items"
            className={buttonVariants({ size: "sm" })}
          >
            Review menu
          </Link>
        }
      />

      {stats.pendingItems > 0 && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
          {stats.pendingItems} menu item{stats.pendingItems === 1 ? "" : "s"}{" "}
          waiting for moderation.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Users"
          value={stats.totalUsers}
          hint={`${stats.customers} customers · ${stats.vendors} vendors`}
          icon={UserGroupIcon}
        />
        <StatCard
          label="Menu items"
          value={stats.totalItems}
          hint={`${stats.approvedItems} approved · ${stats.pendingItems} pending`}
          icon={Pizza01Icon}
        />
        <StatCard
          label="Orders"
          value={stats.totalOrders}
          hint={`${stats.pendingOrders} pending`}
          icon={TruckDeliveryIcon}
          accent={stats.pendingOrders > 0}
        />
        <StatCard
          label="Premium vendors"
          value={stats.premiumVendors}
          hint={`${stats.successfulTransactions}/${stats.transactions} payments succeeded`}
          icon={Invoice01Icon}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Orders by status</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Platform-wide, all vendors.
          </p>
          <OrdersStatusChart data={data.ordersByStatus} />
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold">Items by category</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Every published and pending item.
          </p>
          <div className="grid items-center gap-4 sm:grid-cols-[1fr_170px]">
            <ItemsCategoryChart data={data.itemsByCategory} />
            <CategoryLegend data={data.itemsByCategory} />
          </div>
        </section>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Blocked accounts"
          value={stats.blockedUsers}
          hint="Cannot access the platform"
          icon={CheckmarkCircle02Icon}
        />
        <StatCard
          label="Admins"
          value={stats.admins}
          hint="Full moderation access"
          icon={UserGroupIcon}
        />
        <StatCard
          label="Transactions"
          value={stats.transactions}
          hint="Read-only ledger"
          icon={Invoice01Icon}
        />
      </div>
    </div>
  )
}
