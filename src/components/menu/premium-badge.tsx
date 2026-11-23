import { Badge } from "@/components/ui/badge"

export function PremiumBadge() {
  return (
    <Badge
      variant="outline"
      className="border-brand bg-brand-foreground/95 text-[10px] font-semibold uppercase tracking-wider text-brand"
    >
      Premium
    </Badge>
  )
}
