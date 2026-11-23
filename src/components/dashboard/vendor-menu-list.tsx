"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  PencilEdit01Icon,
  Pizza01Icon,
  RefreshIcon,
  Delete02Icon,
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
import { MenuItemForm } from "@/components/dashboard/menu-item-form"
import { apiFetch } from "@/lib/api"
import { FREE_PLAN_ITEM_LIMIT } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { MenuItem, SubscriptionPlan } from "@/types"

export function VendorMenuList({
  subscriptionPlan,
}: {
  subscriptionPlan: SubscriptionPlan
}) {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<MenuItem | null>(null)
  const [deleting, setDeleting] = useState<MenuItem | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await apiFetch<MenuItem[]>("/menu/vendor/me?limit=50")
      setItems(response.data ?? [])
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load items."
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [load])

  const counted = items.filter(
    (item) => item.status === "pending" || item.status === "approved"
  ).length
  const atLimit = subscriptionPlan !== "premium" && counted >= FREE_PLAN_ITEM_LIMIT

  const toggleAvailability = async (item: MenuItem) => {
    setBusyId(item.id)
    const nextStatus = item.status === "approved" ? "inactive" : "approved"
    try {
      await apiFetch(`/menu/${item.id}/availability`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      })
      toast.success(
        nextStatus === "approved" ? "Item is available" : "Item is inactive"
      )
      await load()
    } catch (toggleError) {
      toast.error(
        toggleError instanceof Error ? toggleError.message : "Update failed."
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
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>
          {counted}/{subscriptionPlan === "premium" ? "∞" : FREE_PLAN_ITEM_LIMIT}{" "}
          counted items
          {subscriptionPlan === "premium" ? " (Premium — unlimited)" : ""}
        </span>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <HugeiconsIcon icon={RefreshIcon} className="size-4" />
          Refresh
        </Button>
      </div>

      {atLimit && (
        <div className="rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
          You have reached the Free plan limit of {FREE_PLAN_ITEM_LIMIT} active
          items. Upgrade to Premium for unlimited items.
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
            <HugeiconsIcon icon={Pizza01Icon} className="size-5" />
          </span>
          <p className="text-sm font-medium">No menu items yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Add your first pizza. It goes live after admin approval.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[260px]">
                    <div className="flex items-center gap-3">
                      <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.images?.[0] ? (
                          <Image
                            src={item.images[0]}
                            alt=""
                            fill
                            sizes="44px"
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
                        {item.status === "rejected" && item.rejectionReason ? (
                          <span className="mt-1 block truncate text-xs text-destructive">
                            {item.rejectionReason}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[170px] truncate text-sm text-muted-foreground">
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
                      {item.status === "approved" || item.status === "inactive" ? (
                        <Button
                          variant="outline"
                          size="xs"
                          disabled={busyId === item.id}
                          onClick={() => toggleAvailability(item)}
                        >
                          {item.status === "approved" ? "Set inactive" : "Activate"}
                        </Button>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        aria-label={`Edit ${item.itemName}`}
                        onClick={() => setEditing(item)}
                      >
                        <HugeiconsIcon icon={PencilEdit01Icon} className="size-4" />
                      </Button>
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
      )}

      <Dialog
        open={Boolean(editing)}
        onOpenChange={(open) => !open && setEditing(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Edit menu item</DialogTitle>
            <DialogDescription>
              Editing a rejected item sends it back for review.
            </DialogDescription>
          </DialogHeader>
          {editing ? (
            <MenuItemForm
              item={editing}
              onSaved={() => {
                setEditing(null)
                void load()
              }}
            />
          ) : null}
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
                ? `Delete “${deleting.itemName}”? Existing orders keep their snapshot, but this cannot be undone.`
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
