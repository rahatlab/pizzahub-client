import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { OrdersList } from "@/components/dashboard/orders-list"

export const metadata: Metadata = { title: "My Orders" }

export default async function CustomerOrdersPage() {
  await requireRole("customer")

  return (
    <div>
      <DashboardPageHeader
        title="My orders"
        description="Every order you place, with its status timeline. Pending orders can still be cancelled."
      />
      <OrdersList mode="placed" />
    </div>
  )
}
