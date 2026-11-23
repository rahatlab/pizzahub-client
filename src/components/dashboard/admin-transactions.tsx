"use client"

import { useCallback, useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { formatCurrency, formatDateTime } from "@/lib/format"
import type { Pagination, TransactionStatus } from "@/types"

type Transaction = {
  id: string
  vendorId: string
  vendor?: {
    id: string
    name: string
    email: string
    businessName: string | null
  }
  plan: "premium"
  amount: number
  currency: string
  status: TransactionStatus
  stripeSessionId: string | null
  createdAt: string
}

const STATUS_ITEMS = [
  { value: "all", label: "All statuses" },
  { value: "success", label: "Success" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
]

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  hasNext: false,
}

export function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [status, setStatus] = useState<TransactionStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" })
      if (status !== "all") params.set("status", status)

      const response = await apiFetch<Transaction[]>(
        `/payment/transactions?${params}`
      )
      setTransactions(response.data ?? [])
      setPagination(response.meta?.pagination ?? EMPTY_PAGINATION)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load transactions."
      )
    } finally {
      setLoading(false)
    }
  }, [page, status])

  useEffect(() => {
    const timer = setTimeout(load, 0)
    return () => clearTimeout(timer)
  }, [load])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select
          items={STATUS_ITEMS}
          value={status}
          onValueChange={(value) => {
            setStatus((value as TransactionStatus | "all") ?? "all")
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
            {pagination.total} transaction{pagination.total === 1 ? "" : "s"}
          </span>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <HugeiconsIcon icon={RefreshIcon} className="size-4" />
            Refresh
          </Button>
        </div>
      </div>

      <p className="rounded-xl border border-border bg-surface/60 px-4 py-3 text-xs text-muted-foreground">
        Read-only ledger. Payment status is written only by the Stripe webhook —
        there is no endpoint to edit it.
      </p>

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
      ) : transactions.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-6 py-14 text-center">
          <HugeiconsIcon
            icon={Invoice01Icon}
            className="size-6 text-muted-foreground"
          />
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Premium checkout attempts appear here once a vendor starts one.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Session</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="max-w-[220px]">
                      <span className="block truncate font-medium">
                        {transaction.vendor?.businessName ||
                          transaction.vendor?.name ||
                          "—"}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {transaction.vendor?.email ?? ""}
                      </span>
                    </TableCell>
                    <TableCell className="capitalize text-sm">
                      {transaction.plan}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-sm tabular-nums">
                      {formatCurrency(transaction.amount / 100, transaction.currency.toUpperCase())}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "success"
                            ? "default"
                            : transaction.status === "failed"
                              ? "destructive"
                              : "outline"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatDateTime(transaction.createdAt)}
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate font-mono text-xs text-muted-foreground">
                      {transaction.stripeSessionId ?? "—"}
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
    </div>
  )
}
