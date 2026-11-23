import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { AdminTransactions } from "@/components/dashboard/admin-transactions"

export const metadata: Metadata = { title: "Transactions" }

export default async function AdminTransactionsPage() {
  await requireRole("admin")

  return (
    <div>
      <DashboardPageHeader
        title="Transactions"
        description="Premium upgrade payments recorded by the Stripe webhook."
      />
      <AdminTransactions />
    </div>
  )
}
