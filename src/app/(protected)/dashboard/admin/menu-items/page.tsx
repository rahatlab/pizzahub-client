import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { AdminMenuList } from "@/components/dashboard/admin-menu-list"

export const metadata: Metadata = { title: "Menu Moderation" }

export default async function AdminMenuPage() {
  await requireRole("admin")

  return (
    <div>
      <DashboardPageHeader
        title="Menu moderation"
        description="Approve, reject, deactivate, or delete menu items. Rejections require a reason the vendor can act on."
      />
      <AdminMenuList />
    </div>
  )
}
