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
  title: "Customer Overview",
}

export default async function CustomerOverviewPage() {
  const user = await requireRole("customer")

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand">
          Customer workspace
        </p>
        <h1 className="mt-2 font-display text-3xl uppercase tracking-tight sm:text-4xl">
          Hey, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Your account is ready. Browse approved local kitchens and place your
          first order from the public menu.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My orders</CardTitle>
            <CardDescription>
              Pending, accepted, rejected, and cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Order tracking arrives in the customer dashboard phase.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Browse menu</CardTitle>
            <CardDescription>Approved items from local kitchens.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Public menu UI is coming in the next phase.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profile</CardTitle>
            <CardDescription>Name, image, and account details.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Profile settings are part of the dashboard phase.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
