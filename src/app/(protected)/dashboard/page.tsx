import { redirect } from "next/navigation"
import { DASHBOARD_PATH } from "@/lib/constants"
import { requireUser } from "@/lib/session"

export default async function DashboardIndexPage() {
  const user = await requireUser("/dashboard")
  redirect(DASHBOARD_PATH[user.role])
}
