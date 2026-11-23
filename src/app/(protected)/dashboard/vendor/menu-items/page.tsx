import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"
import { requireRole } from "@/lib/session"
import { Button } from "@/components/ui/button"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { VendorMenuList } from "@/components/dashboard/vendor-menu-list"

export const metadata: Metadata = { title: "Menu Items" }

export default async function VendorMenuItemsPage() {
  const user = await requireRole("vendor")

  return (
    <div>
      <DashboardPageHeader
        title="Menu items"
        description="Everything you have submitted, with its review and availability state."
        action={
          <Button size="sm" render={<Link href="/dashboard/vendor/add-item" />}>
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Add item
          </Button>
        }
      />
      <VendorMenuList subscriptionPlan={user.subscriptionPlan} />
    </div>
  )
}
