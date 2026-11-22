import type { Metadata } from "next"
import { requireRole } from "@/lib/session"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Admin Overview",
}

export default async function AdminOverviewPage() {
  const user = await requireRole("admin")

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          Admin workspace
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl">
          Platform control
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Signed in as {user.name}. User management, menu moderation, and
          read-only transaction reporting are the next admin phases.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users</CardTitle>
            <CardDescription>Search, filter, block, unblock.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming in the admin users phase.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu moderation</CardTitle>
            <CardDescription>
              Approve, reject, or remove published items.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming in the admin menu phase.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Transactions</CardTitle>
            <CardDescription>Read-only Premium payment records.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming in the admin transactions phase.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
