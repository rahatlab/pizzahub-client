import type { Metadata } from "next"
import Link from "next/link"
import { requireRole } from "@/lib/session"
import { Logo } from "@/components/shared/logo"
import { PremiumPoll } from "@/components/dashboard/premium-poll"

export const metadata: Metadata = { title: "Payment successful" }

export default async function PaymentSuccessPage() {
  await requireRole("vendor")

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-5">
        <Logo />
        <Link
          href="/dashboard/vendor/subscription"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Premium
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8">
          <PremiumPoll />
        </div>
      </main>
    </div>
  )
}
