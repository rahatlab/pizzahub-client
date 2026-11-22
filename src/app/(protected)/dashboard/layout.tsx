import Link from "next/link"
import { requireUser } from "@/lib/session"
import { Logo } from "@/components/shared/logo"
import { SignOutButton } from "@/components/shared/sign-out-button"

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser("/dashboard")

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden rounded-full border border-border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground sm:inline">
              {user.role}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline"
            >
              Back to site
            </Link>
            <span className="hidden text-sm font-medium sm:inline">
              {user.name}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
    </div>
  )
}
