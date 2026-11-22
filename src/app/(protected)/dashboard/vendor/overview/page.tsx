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
  title: "Vendor Overview",
}

export default async function VendorOverviewPage() {
  const user = await requireRole("vendor")

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          Vendor workspace
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          The dashboard foundation is ready. Menu management, incoming orders,
          and the Premium subscription are the next build phases.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your kitchen</CardTitle>
            <CardDescription>
              {user.businessName ?? "Add a business name in profile settings."}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {user.subscriptionPlan === "premium"
              ? "Premium plan is active."
              : "You are on the Free plan — up to 3 active items."}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Menu</CardTitle>
            <CardDescription>Create and publish menu items.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming in the vendor menu phase.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
            <CardDescription>Accept or reject customer orders.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Coming in the orders phase.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
