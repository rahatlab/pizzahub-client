"use client"

import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <main className="grid min-h-[60vh] place-items-center px-4 py-16">
      <div
        role="alert"
        className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center"
      >
        <span className="mx-auto grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
          <HugeiconsIcon icon={Alert02Icon} className="size-6" />
        </span>

        <h1 className="mt-5 font-display text-2xl uppercase tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          We could not finish loading this page. It is usually temporary — try
          again, or head back to the menu.
        </p>

        {error.digest ? (
          <p className="mt-3 text-xs text-muted-foreground">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" render={<Link href="/" />}>
            Back to home
          </Button>
        </div>
      </div>
    </main>
  )
}
