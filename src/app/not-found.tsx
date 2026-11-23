import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pizza01Icon } from "@hugeicons/core-free-icons"
import { Logo } from "@/components/shared/logo"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Page not found",
  description: "The page you were looking for does not exist on PizzaHub.",
}

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <Logo className="justify-center" />

        <span className="mx-auto mt-8 grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
          <HugeiconsIcon icon={Pizza01Icon} className="size-6" />
        </span>

        <p className="mt-5 font-display text-5xl leading-none tracking-tight text-brand">
          404
        </p>
        <h1 className="mt-3 font-display text-2xl uppercase tracking-tight">
          This page went missing
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          The page you are looking for was moved, deleted, or never existed.
          The kitchen is still open though — the menu is right here.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/menu" />}>Browse menu</Button>
          <Button variant="outline" render={<Link href="/" />}>
            Back to home
          </Button>
        </div>
      </div>
    </main>
  )
}
