import { PizzaIllustration } from "@/components/shared/pizza-illustration"
import { cn } from "@/lib/utils"

/** Illustrated placeholder for empty lists, tables and failed data loads. */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-12 text-center",
        className
      )}
    >
      <PizzaIllustration className="size-24" />
      <p className="text-sm font-medium">{title}</p>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  )
}
