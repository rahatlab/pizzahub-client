import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@/lib/utils"

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
  className,
}: {
  label: string
  value: string | number
  hint?: string
  icon?: ComponentProps<typeof HugeiconsIcon>["icon"]
  accent?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5",
        accent && "border-brand/40 bg-brand/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        {icon ? (
          <span
            className={cn(
              "grid size-8 place-items-center rounded-lg bg-muted text-muted-foreground",
              accent && "bg-brand/15 text-brand"
            )}
          >
            <HugeiconsIcon icon={icon} className="size-4" />
          </span>
        ) : null}
      </div>
      <span className="text-2xl font-semibold tabular-nums leading-none">
        {value}
      </span>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  )
}
