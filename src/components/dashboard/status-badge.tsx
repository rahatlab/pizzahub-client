import { Badge } from "@/components/ui/badge"
import { MENU_STATUS_LABELS, ORDER_STATUS_LABELS } from "@/lib/constants"
import type { MenuStatus, OrderStatus } from "@/types"

type Variant = "default" | "secondary" | "destructive" | "outline"

const MENU_VARIANTS: Record<MenuStatus, Variant> = {
  pending: "outline",
  approved: "default",
  rejected: "destructive",
  inactive: "secondary",
}

const ORDER_VARIANTS: Record<OrderStatus, Variant> = {
  pending: "outline",
  accepted: "default",
  rejected: "destructive",
  cancelled: "secondary",
}

export function MenuStatusBadge({ status }: { status: MenuStatus }) {
  return (
    <Badge variant={MENU_VARIANTS[status] ?? "outline"}>
      {MENU_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={ORDER_VARIANTS[status] ?? "outline"}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
