import Link from "next/link"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-8 font-display text-3xl uppercase tracking-tight">
          Wrong dashboard
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          You do not have access to this role’s dashboard. Use the dashboard
          link for your account type.
        </p>
        <Button render={<Link href="/dashboard" />} className="mt-6">
          Go to my dashboard
        </Button>
      </div>
    </main>
  )
}
