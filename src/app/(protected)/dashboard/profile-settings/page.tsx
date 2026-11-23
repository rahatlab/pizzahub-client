import type { Metadata } from "next"
import { requireUser } from "@/lib/session"
import { Card } from "@/components/ui/card"
import { DashboardPageHeader } from "@/components/dashboard/dashboard-shell"
import { ProfileForm } from "@/components/dashboard/profile-form"

export const metadata: Metadata = { title: "Profile Settings" }

export default async function ProfileSettingsPage() {
  const user = await requireUser("/dashboard/profile-settings")

  return (
    <div className="max-w-3xl">
      <DashboardPageHeader
        title="Profile settings"
        description="Update how your account appears across PizzaHub."
      />
      <Card className="p-5 sm:p-6">
        <ProfileForm user={user} />
      </Card>
    </div>
  )
}
