import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CancelCircleIcon } from "@hugeicons/core-free-icons"
import { requireRole } from "@/lib/session"
import { Logo } from "@/components/shared/logo"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = { title: "Checkout cancelled" }

export default async function PaymentCancelPage() {
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
        <div className="w-full max-w-lg space-y-5 rounded-2xl border border-border bg-card p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <HugeiconsIcon icon={CancelCircleIcon} className="size-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl">Checkout cancelled</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              No payment was taken and your plan has not changed. You can start
              checkout again whenever you are ready.
            </p>
          </div>
          <Link
            href="/dashboard/vendor/subscription"
            className={buttonVariants({ size: "sm" })}
          >
            Back to Premium
          </Link>
        </div>
      </main>
    </div>
  )
}
