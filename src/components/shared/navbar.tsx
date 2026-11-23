"use client"

import { useState } from "react"
import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  MoonIcon,
  Settings01Icon,
  SunIcon,
  UserIcon,
} from "@hugeicons/core-free-icons"
import { Logo } from "@/components/shared/logo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useTheme } from "@/providers/theme-provider"
import { authClient } from "@/lib/auth-client"
import { DASHBOARD_PATH } from "@/lib/constants"
import { cn } from "@/lib/utils"
import type { Role } from "@/types"

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Browse Menu" },
]

function Icon({
  icon,
  className,
}: {
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  className?: string
}) {
  return <HugeiconsIcon icon={icon} className={className} />
}

export function Navbar() {
  const { data: session, isPending } = authClient.useSession()
  const { setTheme, resolvedTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  // next-themes resolves the theme after hydration; until then both the
  // server and the first client render agree on the default icon.
  const isDark = resolvedTheme === "dark"

  const handleSignOut = async () => {
    await authClient.signOut()
    setMobileOpen(false)
    router.push("/")
    router.refresh()
  }

  const isSignedIn = Boolean(session?.user)
  const role = ((session?.user as { role?: Role } | undefined)?.role ??
    "customer") as Role
  const dashboardPath = DASHBOARD_PATH[role]
  const dashboardLabel =
    role === "admin"
      ? "Admin Dashboard"
      : role === "vendor"
        ? "Vendor Dashboard"
        : "My Orders"

  const userName = session?.user?.name ?? "User"
  const userImage = session?.user?.image ?? undefined
  const initials = userName.slice(0, 1).toUpperCase()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/65">
      <div className="mx-auto flex h-16 w-full max-w-[1240px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />

          <nav className="hidden items-center gap-7 text-sm font-medium lg:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "transition-colors hover:text-brand",
                  isActive(link.href) ? "text-brand" : "text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
            {isSignedIn && (
              <Link
                href={dashboardPath}
                aria-current={
                  pathname.startsWith("/dashboard") ? "page" : undefined
                }
                className={cn(
                  "inline-flex items-center gap-1.5 transition-colors hover:text-brand",
                  pathname.startsWith("/dashboard")
                    ? "text-brand"
                    : "text-foreground"
                )}
              >
                <Icon icon={LayoutDashboardIcon} className="size-4" />
                {dashboardLabel}
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Icon icon={isDark ? MoonIcon : SunIcon} className="size-4" />
          </Button>

          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-lg bg-muted" />
          ) : isSignedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 px-2.5 sm:px-3"
                  />
                }
              >
                <Avatar className="size-6">
                  {userImage ? <AvatarImage src={userImage} alt="" /> : null}
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[120px] truncate sm:inline">
                  {userName}
                </span>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-60">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-medium">{userName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem render={<Link href={dashboardPath} />}>
                  <Icon
                    icon={LayoutDashboardIcon}
                    className="size-4 text-muted-foreground"
                  />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  render={<Link href="/dashboard/profile-settings" />}
                >
                  <Icon
                    icon={Settings01Icon}
                    className="size-4 text-muted-foreground"
                  />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleSignOut}
                >
                  <Icon icon={LogOutIcon} className="size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-3 sm:flex">
              <Link
                href="/sign-in"
                className="text-sm font-medium transition-colors hover:text-brand"
              >
                Sign in
              </Link>
              <Button size="sm" render={<Link href="/sign-up" />}>
                Sign up
              </Button>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="lg:hidden"
                  aria-label="Open navigation menu"
                />
              }
            >
              <Icon icon={MenuIcon} className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-[86vw] max-w-[300px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="border-b border-border px-5 py-5">
                <Logo />
              </div>

              <nav className="flex flex-col gap-1 p-4 text-sm font-medium">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {link.label}
                  </Link>
                ))}

                {isSignedIn ? (
                  <>
                    <Link
                      href={dashboardPath}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      {dashboardLabel}
                    </Link>
                    <Link
                      href="/dashboard/profile-settings"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Profile Settings
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-3"
                      onClick={handleSignOut}
                    >
                      <Icon icon={LogOutIcon} className="size-4" />
                      Sign out
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/sign-in"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-lg px-3 py-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      Sign in
                    </Link>
                    <Button
                      size="sm"
                      className="mt-3"
                      render={
                        <Link href="/sign-up" onClick={() => setMobileOpen(false)} />
                      }
                    >
                      <Icon icon={UserIcon} className="size-4" />
                      Sign up
                    </Button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
