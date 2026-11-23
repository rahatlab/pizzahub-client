"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  ClockIcon,
  Pizza01Icon,
  RefreshIcon,
  TruckDeliveryIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusBadge } from "@/components/dashboard/status-badge"
import { apiFetch } from "@/lib/api"
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/constants"
import { formatCurrency, formatDate } from "@/lib/format"
import type { Order, OrderStatus, Pagination } from "@/types"

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  ...ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  })),
]

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNext: false,
}

export function OrdersList({
  mode,
}: {
  mode: "incoming" | "placed"
}) {
  const [orders, setOrders] = useState<Order[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [status, setStatus] = useState<OrderStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [detail, setDetail] = useState<Order | null>(null)
  const [rejecting, setRejecting] = useState<Order | null>(null)
  const [rejectReason, setRejectReason] = useState("")

  const endpoint = mode === "incoming" ? "/orders/vendor" : "/orders/my"

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (status !== "all") params.set("status", status)

      const response = await apiFetch<Order[]>(`${endpoint}?${params}`)
      setOrders(response.data ?? [])
      setPagination(response.meta?.pagination ?? EMPTY_PAGINATION)
    } catch (loadError) {
      setOrders([])
      setError(
        loadError instanceof Error ? loadError.message : "Could not load orders."
      )
    } finally {
      setLoading(false)
    }
  }, [endpoint, page, status])

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [load])

  const act = async (
    order: Order,
    action: "accept" | "reject" | "cancel",
    body?: Record<string, unknown>
  ) => {
    setBusyId(order.id)
    try {
      await apiFetch(`/orders/${order.id}/${action}`, {
        method: "PATCH",
        ...(body ? { body: JSON.stringify(body) } : {}),
      })
      toast.success(
        action === "accept"
          ? "Order accepted"
          : action === "reject"
            ? "Order rejected"
            : "Order cancelled"
      )
      setRejecting(null)
      setRejectReason("")
      await load()
    } catch (actionError) {
      toast.error(
        actionError instanceof Error ? actionError.message : "Action failed."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          items={STATUS_ITEMS}
          value={status}
          onValueChange={(value) => {
            setStatus((value as OrderStatus | "all") ?? "all")
            setPage(1)
          }}
        >
          <SelectTrigger className="w-[190px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_ITEMS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>
            {pagination.total} order{pagination.total === 1 ? "" : "s"}
          </span>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <HugeiconsIcon icon={RefreshIcon} className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon icon={TruckDeliveryIcon} className="size-5" />
          </span>
          <p className="text-sm font-medium">No orders here</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            {mode === "incoming"
              ? "Orders placed with your kitchen will appear here."
              : "Order something from the menu to see it here."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  {mode === "incoming" ? <TableHead>Customer</TableHead> : null}
                  <TableHead>Delivery</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="max-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {order.itemImage ? (
                            <Image
                              src={order.itemImage}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="grid h-full place-items-center text-muted-foreground">
                              <HugeiconsIcon icon={Pizza01Icon} className="size-4" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="block truncate font-medium">
                            {order.itemName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {mode === "incoming" ? order.vendorName : order.vendorName}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    {mode === "incoming" ? (
                      <TableCell className="max-w-[160px]">
                        <span className="block truncate text-sm">
                          {order.customer?.name ?? "—"}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {order.customer?.email ?? ""}
                        </span>
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
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => setDetail(order)}
                        >
                          Details
                        </Button>
                        {mode === "incoming" && order.status === "pending" ? (
                          <>
                            <Button
                              size="xs"
                              disabled={busyId === order.id}
                              onClick={() => act(order, "accept")}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              disabled={busyId === order.id}
                              onClick={() => {
                                setRejecting(order)
                                setRejectReason("")
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {mode === "placed" && order.status === "pending" ? (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={busyId === order.id}
                            onClick={() => act(order, "cancel")}
                          >
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Details + timeline */}
      <Dialog open={Boolean(detail)} onOpenChange={(open) => !open && setDetail(null)}>
        <DialogContent className="sm:max-w-[520px]">
          {detail ? (
            <>
              <DialogHeader>
                <DialogTitle>{detail.itemName}</DialogTitle>
                <DialogDescription>
                  Placed {formatDate(detail.createdAt)} · {detail.vendorName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Delivery date
                    </p>
                    <p className="mt-1">{formatDate(detail.deliveryDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Price
                    </p>
                    <p className="mt-1 tabular-nums">
                      {formatCurrency(detail.itemPrice)}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Address
                  </p>
                  <p className="mt-1">{detail.deliveryAddress}</p>
                </div>

                {detail.message ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Message
                    </p>
                    <p className="mt-1 text-muted-foreground">{detail.message}</p>
                  </div>
                ) : null}

                {detail.rejectionReason ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Rejection reason
                    </p>
                    <p className="mt-1 text-destructive">
                      {detail.rejectionReason}
                    </p>
                  </div>
                ) : null}

                <OrderTimeline order={detail} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Reject with optional reason */}
      <Dialog
        open={Boolean(rejecting)}
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(null)
            setRejectReason("")
          }
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Reject order</DialogTitle>
            <DialogDescription>
              The customer will see this order as rejected. This cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason (optional)</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Out of ingredients for that date"
              minLength={3}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejecting(null)
                setRejectReason("")
              }}
            >
              Keep pending
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(busyId) || (rejectReason.length > 0 && rejectReason.trim().length < 3)}
              onClick={() =>
                rejecting &&
                act(rejecting, "reject", {
                  ...(rejectReason.trim()
                    ? { rejectionReason: rejectReason.trim() }
                    : {}),
                })
              }
            >
              Reject order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrderTimeline({ order }: { order: Order }) {
  const steps = [
    { key: "placed", label: "Order placed", done: true, icon: ClockIcon },
    {
      key: "outcome",
      label:
        order.status === "accepted"
          ? "Accepted by vendor"
          : order.status === "rejected"
            ? "Rejected by vendor"
            : order.status === "cancelled"
              ? "Cancelled"
              : "Awaiting vendor response",
      done: order.status !== "pending",
      icon:
        order.status === "accepted"
          ? CheckmarkCircle02Icon
          : order.status === "pending"
            ? ClockIcon
            : TruckDeliveryIcon,
    },
  ]

  return (
    <div className="space-y-3 rounded-xl border border-border p-4">
      <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
        Status timeline
      </p>
      <ol className="space-y-3">
        {steps.map((step) => (
          <li key={step.key} className="flex items-center gap-3">
            <span
              className={`grid size-7 place-items-center rounded-full ${
                step.done
                  ? "bg-brand/15 text-brand"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <HugeiconsIcon icon={step.icon} className="size-3.5" />
            </span>
            <span className="text-sm">{step.label}</span>
          </li>
        ))}
      </ol>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-[10px]">
          Pending → Accepted
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          Rejected / Cancelled are final
        </Badge>
      </div>
    </div>
  )
}
