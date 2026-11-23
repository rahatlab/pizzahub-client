"use client"

import { useState } from "react"
import type { ComponentProps } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  ArrowUpRight01Icon,
  CreditCardIcon,
  DashboardSquare01Icon,
  Invoice01Icon,
  LayoutDashboardIcon,
  Logout01Icon,
  MenuIcon,
  Pizza01Icon,
  Settings01Icon,
  ShoppingBag01Icon,
  Store01Icon,
  TruckDeliveryIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { Logo } from "@/components/shared/logo"
import { EmptyState } from "@/components/shared/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import type { CurrentUser, Role } from "@/types"

type NavItem = {
  href: string
  label: string
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
}

type NavGroup = { label: string; items: NavItem[] }

const VENDOR_NAV: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard/vendor/overview", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/vendor/orders", label: "Incoming Orders", icon: TruckDeliveryIcon },
      { href: "/dashboard/vendor/my-orders", label: "My Orders", icon: ShoppingBag01Icon },
    ],
  },
  {
    label: "Menu",
    items: [
      { href: "/dashboard/vendor/menu-items", label: "Menu Items", icon: Pizza01Icon },
      { href: "/dashboard/vendor/add-item", label: "Add Item", icon: Add01Icon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/vendor/subscription", label: "Premium", icon: CreditCardIcon },
      { href: "/dashboard/profile-settings", label: "Profile Settings", icon: Settings01Icon },
    ],
  },
]

const CUSTOMER_NAV: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard/customer/overview", label: "Overview", icon: LayoutDashboardIcon },
      { href: "/dashboard/customer/my-orders", label: "My Orders", icon: ShoppingBag01Icon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/profile-settings", label: "Profile Settings", icon: Settings01Icon },
    ],
  },
]

const ADMIN_NAV: NavGroup[] = [
  {
    label: "Platform",
    items: [
      { href: "/dashboard/admin/overview", label: "Overview", icon: DashboardSquare01Icon },
      { href: "/dashboard/admin/users", label: "Users", icon: UserGroupIcon },
      { href: "/dashboard/admin/menu-items", label: "Menu Moderation", icon: Store01Icon },
      { href: "/dashboard/admin/transactions", label: "Transactions", icon: Invoice01Icon },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/profile-settings", label: "Profile Settings", icon: Settings01Icon },
    ],
  },
]

const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  vendor: VENDOR_NAV,
  customer: CUSTOMER_NAV,
  admin: ADMIN_NAV,
}

const ROLE_LABEL: Record<Role, string> = {
  vendor: "Vendor",
  customer: "Customer",
  admin: "Admin",
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function DashboardShell({
  user,
  children,
}: {
  user: CurrentUser
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const groups = NAV_BY_ROLE[user.role]
  const activeItem = groups
    .flatMap((group) => group.items)
    .find((item) => isActivePath(pathname, item.href))

  const initials = (user.name || user.email || "P").slice(0, 1).toUpperCase()
  const showUpgrade = user.role === "vendor" && user.subscriptionPlan !== "premium"

  const handleSignOut = async () => {
    await authClient.signOut()
    router.push("/sign-in")
    router.refresh()
  }

  const renderNav = () => (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/70">
            {group.label}
          </p>
          {group.items.map((item) => {
            const active = isActivePath(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg border-l-2 border-transparent px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "border-brand bg-brand/10 font-medium text-brand"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <HugeiconsIcon icon={item.icon} className="size-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            )
          })}
        </div>
      ))}
    </nav>
  )

  const profileBlock = (
    <div className="flex items-center gap-3 border-b border-border px-4 py-4">
      <Avatar className="size-9">
        {user.image ? <AvatarImage src={user.image} alt="" /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{user.name || "Account"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {user.businessName || user.email}
        </p>
      </div>
      <Badge variant="secondary" className="ml-auto shrink-0 text-[10px]">
        {ROLE_LABEL[user.role]}
      </Badge>
    </div>
  )

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[264px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface/50 lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
          <Logo />
        </div>
        {profileBlock}
        {renderNav()}

        {showUpgrade && (
          <div className="border-t border-border p-3">
            <div className="rounded-xl bg-gradient-to-br from-brand/20 via-brand/5 to-transparent p-4">
              <p className="text-sm font-semibold">Upgrade to Premium</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Unlimited menu items, featured placement, and a Premium badge.
              </p>
              <Button
                size="sm"
                className="mt-3 w-full"
                render={<Link href="/dashboard/vendor/subscription" />}
              >
                View plans
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border bg-background/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="lg:hidden"
                    aria-label="Open dashboard menu"
                  />
                }
              >
                <HugeiconsIcon icon={MenuIcon} className="size-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[86vw] max-w-[300px] p-0">
                <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
                <div className="flex h-16 items-center border-b border-border px-5">
                  <Logo />
                </div>
                {profileBlock}
                {renderNav()}
              </SheetContent>
            </Sheet>

            <p className="truncate text-sm font-medium">
              {activeItem?.label ?? "Dashboard"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              render={<Link href="/" />}
              className="hidden sm:inline-flex"
            >
              View site
              <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleSignOut}
              aria-label="Sign out"
            >
              <HugeiconsIcon icon={Logout01Icon} className="size-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-2xl leading-none tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  )
}

export function DashboardEmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: React.ReactNode
}) {
  return <EmptyState title={title} description={description} action={action} />
}
