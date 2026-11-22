import Link from "next/link"
import { Logo } from "@/components/shared/logo"

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(255,159,28,0.13),transparent_42%),radial-gradient(circle_at_10%_90%,rgba(230,57,70,0.08),transparent_40%)]"
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <Logo />
          <LinkHome />
        </header>
        <main className="flex flex-1 items-center justify-center px-4 pb-16 pt-4">
          {children}
        </main>
      </div>
    </div>
  )
}

function LinkHome() {
  return (
    <Link
      href="/"
      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      Back to home
    </Link>
  )
}
