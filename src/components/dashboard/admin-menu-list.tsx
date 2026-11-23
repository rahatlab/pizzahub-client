"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Pizza01Icon,
  RefreshIcon,
  SearchIcon,
} from "@hugeicons/core-free-icons"
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
import { MenuStatusBadge } from "@/components/dashboard/status-badge"
import { apiFetch } from "@/lib/api"
import { MENU_STATUSES, MENU_STATUS_LABELS } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { MenuItem, MenuStatus, Pagination } from "@/types"

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  ...MENU_STATUSES.map((status) => ({
    value: status,
    label: MENU_STATUS_LABELS[status],
  })),
]

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
}

export function AdminMenuList() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState<MenuStatus | "all">("pending")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<MenuItem | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [deleting, setDeleting] = useState<MenuItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (search.trim()) params.set("search", search.trim())
      if (status !== "all") params.set("status", status)

      const response = await apiFetch<MenuItem[]>(`/menu/admin/all?${params}`)
      setItems(response.data ?? [])
      setPagination(response.meta?.pagination ?? EMPTY_PAGINATION)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load items."
      )
    } finally {
      setLoading(false)
    }
  }, [page, search, status])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const setItemStatus = async (
    item: MenuItem,
    nextStatus: MenuStatus,
    rejectionReason?: string
  ) => {
    setBusyId(item.id)
    try {
      await apiFetch(`/menu/${item.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
          ...(rejectionReason ? { rejectionReason } : {}),
        }),
      })
      toast.success(
        nextStatus === "approved"
          ? "Item approved"
          : nextStatus === "rejected"
            ? "Item rejected"
            : "Item set inactive"
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

  const remove = async (item: MenuItem) => {
    setBusyId(item.id)
    try {
      await apiFetch(`/menu/${item.id}`, { method: "DELETE" })
      toast.success("Item deleted")
      setDeleting(null)
      await load()
    } catch (deleteError) {
      toast.error(
        deleteError instanceof Error ? deleteError.message : "Delete failed."
      )
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative sm:max-w-xs">
            <HugeiconsIcon
              icon={SearchIcon}
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Search items"
              className="pl-10"
              aria-label="Search menu items"
            />
          </div>
          <Select
            items={STATUS_ITEMS}
            value={status}
            onValueChange={(value) => {
              setStatus((value as MenuStatus | "all") ?? "all")
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
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{pagination.total} items</span>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <HugeiconsIcon icon={RefreshIcon} className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <HugeiconsIcon icon={Pizza01Icon} className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium">Nothing to moderate here</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Change the status filter to review approved, rejected, or inactive
            items.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[240px]">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                          {item.images?.[0] ? (
                            <Image
                              src={item.images[0]}
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
                            {item.itemName}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {item.location}
                          </span>
                          {item.rejectionReason ? (
                            <span className="block truncate text-xs text-destructive">
                              {item.rejectionReason}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                      {item.vendor?.businessName || item.vendor?.name || "—"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                      {item.category}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm tabular-nums">
                      {formatCurrency(item.price)}
                    </TableCell>
                    <TableCell>
                      <MenuStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {item.status !== "approved" ? (
                          <Button
                            size="xs"
                            disabled={busyId === item.id}
                            onClick={() => setItemStatus(item, "approved")}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={busyId === item.id}
                            onClick={() => setItemStatus(item, "inactive")}
                          >
                            Set inactive
                          </Button>
                        )}
                        {item.status !== "rejected" ? (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={busyId === item.id}
                            onClick={() => {
                              setRejecting(item)
                              setRejectReason("")
                            }}
                          >
                            Reject
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label={`Delete ${item.itemName}`}
                          onClick={() => setDeleting(item)}
                        >
                          <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                        </Button>
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
            <DialogTitle>Reject item</DialogTitle>
            <DialogDescription>
              The vendor sees this reason and can edit the item to resubmit it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="admin-reject-reason">Reason</Label>
            <Input
              id="admin-reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Photo does not match the item"
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(busyId) || rejectReason.trim().length < 3}
              onClick={() =>
                rejecting &&
                setItemStatus(rejecting, "rejected", rejectReason.trim())
              }
            >
              Reject item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Delete item</DialogTitle>
            <DialogDescription>
              {deleting
                ? `Delete “${deleting.itemName}”? Order history keeps its snapshot; this cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Keep item
            </Button>
            <Button
              variant="destructive"
              disabled={Boolean(busyId)}
              onClick={() => deleting && remove(deleting)}
            >
              Delete item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
