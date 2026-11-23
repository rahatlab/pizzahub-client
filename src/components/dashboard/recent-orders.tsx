import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/dashboard/status-badge"
import { EmptyState } from "@/components/shared/empty-state"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Order } from "@/types"

export function RecentOrdersTable({
  orders,
  showCustomer = false,
}: {
  orders: Order[]
  showCustomer?: boolean
}) {
  if (orders.length === 0) {
    return (
      <div className="px-5 py-6">
        <EmptyState
          className="border-0 bg-transparent px-0 py-6"
          title="No orders yet"
          description="Orders appear here as soon as they are placed."
        />
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          {showCustomer ? <TableHead>Customer</TableHead> : null}
          <TableHead>Delivery</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="max-w-[220px]">
              <span className="block truncate font-medium">
                {order.itemName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {order.vendorName}
              </span>
            </TableCell>
            {showCustomer ? (
              <TableCell className="max-w-[160px] truncate text-sm">
                {order.customer?.name ?? "—"}
              </TableCell>
            ) : null}
            <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
              {formatDate(order.deliveryDate)}
            </TableCell>
            <TableCell className="whitespace-nowrap text-right text-sm tabular-nums">
              {formatCurrency(order.itemPrice)}
            </TableCell>
            <TableCell>
              <OrderStatusBadge status={order.status} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
