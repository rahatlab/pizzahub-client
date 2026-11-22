import Link from "next/link"
import { SignOutButton } from "@/components/shared/sign-out-button"
import { Logo } from "@/components/shared/logo"

export default function BlockedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center">
        <Logo className="justify-center" />
        <h1 className="mt-8 font-display text-3xl uppercase tracking-tight">
          Account blocked
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          This account cannot use protected PizzaHub features right now. If you
          think this is a mistake, contact the PizzaHub team.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <SignOutButton />
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  )
}
