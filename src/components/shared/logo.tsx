import Link from "next/link"
import { cn } from "@/lib/utils"

export function Logo({
  className,
  href = "/",
}: {
  className?: string
  href?: string
}) {
  return (
    <Link
      href={href}
      aria-label="PizzaHub home"
      className={cn("inline-flex items-center gap-2.5", className)}
    >
      <span className="grid size-9 place-items-center rounded-[10px] bg-brand text-brand-foreground shadow-[0_10px_28px_rgba(255,159,28,0.24)]">
        <svg
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 2 3 21l9-3 9 3L12 2Z" />
          <path d="M12 2v16" />
          <circle cx="9" cy="13" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15" cy="11" r="0.9" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="font-display text-lg leading-none tracking-[0.02em]">
        PIZZA<span className="text-brand">HUB</span>
      </span>
    </Link>
  )
}
