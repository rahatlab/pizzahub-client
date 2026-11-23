import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { AdminUsers } from "@/components/dashboard/admin-users"

export const metadata: Metadata = { title: "Users" }

export default async function AdminUsersPage() {
  await requireRole("admin")

  return (
    <div>
      <DashboardPageHeader
        title="Users"
        description="Search accounts, inspect activity, and block or unblock customers and vendors. Admins cannot be blocked."
      />
      <AdminUsers />
    </div>
  )
}
