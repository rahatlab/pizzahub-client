import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { OrdersList } from "@/components/dashboard/orders-list"

export const metadata: Metadata = { title: "My Orders" }

export default async function VendorMyOrdersPage() {
  await requireRole("vendor")

  return (
    <div>
      <DashboardPageHeader
        title="My orders"
        description="Orders you placed with other kitchens. You can cancel any order that is still pending."
      />
      <OrdersList mode="placed" />
    </div>
  )
}
