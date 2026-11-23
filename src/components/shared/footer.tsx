import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CallIcon,
  Mail01Icon,
  MapsLocation01Icon,
  NewTwitterIcon,
} from "@hugeicons/core-free-icons"
import { Logo } from "@/components/shared/logo"
import { Separator } from "@/components/ui/separator"

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Browse Menu", href: "/menu" },
  { label: "Sign in", href: "/sign-in" },
  { label: "Sign up", href: "/sign-up" },
]

const CONTACTS = [
  { icon: Mail01Icon, value: "hello@pizzahub.local", href: "mailto:hello@pizzahub.local" },
  { icon: CallIcon, value: "+880 1234 567890", href: "tel:+8801234567890" },
  { icon: MapsLocation01Icon, value: "Gulshan, Dhaka, Bangladesh", href: null },
]

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-surface">
      <div className="mx-auto w-full max-w-[1240px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-5">
            <Logo />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              PizzaHub connects pizza lovers with approved local kitchens.
              Browse the menu, place an order, and follow it through to
              acceptance.
            </p>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Quick links
            </h2>
            <ul className="space-y-2">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 lg:col-span-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contact
            </h2>
            <ul className="space-y-2.5">
              {CONTACTS.map((contact) => (
                <li
                  key={contact.value}
                  className="flex items-start gap-2.5 text-sm text-muted-foreground"
                >
                  <HugeiconsIcon
                    icon={contact.icon}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="transition-colors hover:text-foreground"
                    >
                      {contact.value}
                    </a>
                  ) : (
                    <span>{contact.value}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 lg:col-span-1">
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Follow
            </h2>
            <a
              href="https://x.com/pizzahub"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="PizzaHub on X"
              className="grid size-9 place-items-center rounded-lg border border-border bg-background transition-colors hover:border-brand hover:text-brand"
            >
              <HugeiconsIcon icon={NewTwitterIcon} className="size-4" />
            </a>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-start justify-between gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} PizzaHub. All rights reserved.</p>
          <p>Hot. Fresh. Pizza.</p>
        </div>
      </div>
    </footer>
  )
}
