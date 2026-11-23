"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon, SearchIcon, UserGroupIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
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
import { apiFetch } from "@/lib/api"
import { formatDate } from "@/lib/format"
import type { Pagination } from "@/types"
import type { AdminUserDetail } from "@/types/dashboard"

type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  role: "customer" | "vendor" | "admin"
  isBlocked: boolean
  businessName: string | null
  subscriptionPlan: "free" | "premium"
  createdAt: string | null
}

const ROLE_ITEMS = [
  { value: "all", label: "All roles" },
  { value: "customer", label: "Customer" },
  { value: "vendor", label: "Vendor" },
  { value: "admin", label: "Admin" },
]

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
}

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [revokeTarget, setRevokeTarget] = useState<AdminUser | null>(null)
  const [revoking, setRevoking] = useState(false)
  const [detail, setDetail] = useState<AdminUserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (search.trim()) params.set("search", search.trim())
      if (role !== "all") params.set("role", role)

      const response = await apiFetch<AdminUser[]>(`/users?${params}`)
      setUsers(response.data ?? [])
      setPagination(response.meta?.pagination ?? EMPTY_PAGINATION)
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load users."
      )
    } finally {
      setLoading(false)
    }
  }, [page, role, search])

  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
  }, [load])

  const toggleBlock = async (user: AdminUser) => {
    setBusyId(user.id)
    try {
      await apiFetch(
        `/users/${user.id}/${user.isBlocked ? "unblock" : "block"}`,
        { method: "PATCH" }
      )
      toast.success(user.isBlocked ? "User unblocked" : "User blocked", {
        description:
          !user.isBlocked && user.role === "vendor"
            ? "Their pending and approved items were set inactive."
            : undefined,
      })
      await load()
    } catch (blockError) {
      toast.error(
        blockError instanceof Error ? blockError.message : "Action failed."
      )
    } finally {
      setBusyId(null)
    }
  }

  const revokePremium = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    try {
      const response = await apiFetch<{
        deactivatedItems: number
        rejectedItems: number
      }>(`/users/${revokeTarget.id}/premium`, { method: "DELETE" })

      const deactivated = response.data?.deactivatedItems ?? 0
      const rejected = response.data?.rejectedItems ?? 0
      const moved: string[] = []
      if (deactivated > 0) {
        moved.push(`${deactivated} item${deactivated === 1 ? "" : "s"} set inactive`)
      }
      if (rejected > 0) {
        moved.push(
          `${rejected} pending item${rejected === 1 ? "" : "s"} sent back for changes`
        )
      }

      toast.success("Premium removed", {
        description:
          moved.length > 0
            ? `${revokeTarget.name || "Vendor"} is back on the free plan; ${moved.join(" and ")}.`
            : `${revokeTarget.name || "Vendor"} is back on the free plan.`,
      })
      setRevokeTarget(null)
      await load()
    } catch (revokeError) {
      toast.error(
        revokeError instanceof Error ? revokeError.message : "Action failed."
      )
    } finally {
      setRevoking(false)
    }
  }

  const openDetail = async (user: AdminUser) => {
    setDetailLoading(true)
    setDetail({
      user,
      stats: { menuItems: 0, ordersPlaced: 0, ordersReceived: 0 },
    })
    try {
      const response = await apiFetch<AdminUserDetail>(`/users/${user.id}`)
      if (response.data) setDetail(response.data)
    } catch (detailError) {
      toast.error(
        detailError instanceof Error ? detailError.message : "Load failed."
      )
      setDetail(null)
    } finally {
      setDetailLoading(false)
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
              placeholder="Search name or email"
              className="pl-10"
              aria-label="Search users"
            />
          </div>
          <Select
            items={ROLE_ITEMS}
            value={role}
            onValueChange={(value) => {
              setRole(String(value ?? "all"))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span>{pagination.total} users</span>
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
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <HugeiconsIcon
            icon={UserGroupIcon}
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">No users found</p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="max-w-[260px]">
                      <span className="block truncate font-medium">
                        {user.name || "—"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.subscriptionPlan === "premium" ? "default" : "outline"}
                      >
                        {user.subscriptionPlan}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isBlocked ? "destructive" : "secondary"}>
                        {user.isBlocked ? "Blocked" : "Active"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => openDetail(user)}
                        >
                          Details
                        </Button>
                        {user.role !== "admin" ? (
                          <Button
                            variant={user.isBlocked ? "outline" : "destructive"}
                            size="xs"
                            disabled={busyId === user.id}
                            onClick={() => toggleBlock(user)}
                          >
                            {user.isBlocked ? "Unblock" : "Block"}
                          </Button>
                        ) : null}
                        {user.role === "vendor" &&
                        user.subscriptionPlan === "premium" ? (
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={busyId === user.id}
                            onClick={() => setRevokeTarget(user)}
                          >
                            Remove premium
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

      <Dialog
        open={Boolean(detail)}
        onOpenChange={(open) => !open && setDetail(null)}
      >
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{detail?.user.name || "User detail"}</DialogTitle>
            <DialogDescription>{detail?.user.email}</DialogDescription>
          </DialogHeader>

          {detail ? (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Role
                  </p>
                  <p className="mt-1 capitalize">{detail.user.role}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Plan
                  </p>
                  <p className="mt-1 capitalize">{detail.user.subscriptionPlan}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Joined
                  </p>
                  <p className="mt-1">{formatDate(detail.user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-1">
                    {detail.user.isBlocked ? "Blocked" : "Active"}
                  </p>
                </div>
              </div>

              {detail.user.businessName ? (
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    Business
                  </p>
                  <p className="mt-1">{detail.user.businessName}</p>
                </div>
              ) : null}

              <div className="grid grid-cols-3 gap-3 rounded-xl border border-border p-4 text-center">
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {detailLoading ? "…" : detail.stats.menuItems}
                  </p>
                  <p className="text-xs text-muted-foreground">Menu items</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {detailLoading ? "…" : detail.stats.ordersPlaced}
                  </p>
                  <p className="text-xs text-muted-foreground">Orders placed</p>
                </div>
                <div>
                  <p className="text-lg font-semibold tabular-nums">
                    {detailLoading ? "…" : detail.stats.ordersReceived}
                  </p>
                  <p className="text-xs text-muted-foreground">Received</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(revokeTarget)}
        onOpenChange={(open) => !open && !revoking && setRevokeTarget(null)}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Remove Premium</DialogTitle>
            <DialogDescription>
              {revokeTarget?.name || "This vendor"} ({revokeTarget?.email})
              will go back to the free plan. Payment records stay unchanged;
              approved items beyond the free limit go inactive, and pending
              ones are sent back to the vendor.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setRevokeTarget(null)}
              disabled={revoking}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={revokePremium}
              disabled={revoking}
            >
              {revoking ? "Removing…" : "Remove premium"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
