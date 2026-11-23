import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { OrdersList } from "@/components/dashboard/orders-list"

export const metadata: Metadata = { title: "Incoming Orders" }

export default async function VendorOrdersPage() {
  await requireRole("vendor")

  return (
    <div>
      <DashboardPageHeader
        title="Incoming orders"
        description="Accept or reject pending orders. A decision can only be made once, and only while the order is pending."
      />
      <OrdersList mode="incoming" />
    </div>
  )
}
