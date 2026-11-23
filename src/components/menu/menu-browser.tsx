"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon, SearchIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MenuItemCard } from "@/components/menu/menu-item-card"
import { EmptyState } from "@/components/shared/empty-state"
import { Reveal } from "@/components/shared/reveal"
import { CATEGORIES } from "@/lib/constants"
import { PUBLIC_API_URL } from "@/lib/api-url"
import type { ApiResponse, MenuItem, Pagination } from "@/types"

const PAGE_SIZE = 12

type SortOption = "newest" | "price_asc" | "price_desc"

const SORT_ITEMS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
]

const CATEGORY_ITEMS = [
  { value: "all", label: "All categories" },
  ...CATEGORIES.map((value) => ({ value, label: value })),
]

const EMPTY_PAGINATION: Pagination = {
  page: 1,
  limit: PAGE_SIZE,
  total: 0,
  totalPages: 0,
  hasNext: false,
}

function asSortOption(value: string | null): SortOption {
  return value === "price_asc" || value === "price_desc" ? value : "newest"
}

export function MenuBrowser() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [category, setCategory] = useState(searchParams.get("category") ?? "all")
  const [location, setLocation] = useState(searchParams.get("location") ?? "")
  const [sort, setSort] = useState<SortOption>(
    asSortOption(searchParams.get("sort"))
  )
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1)

  const [items, setItems] = useState<MenuItem[]>([])
  const [pagination, setPagination] = useState<Pagination>(EMPTY_PAGINATION)
  const [locations, setLocations] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (search.trim()) params.set("search", search.trim())
    if (category !== "all") params.set("category", category)
    if (location) params.set("location", location)
    params.set("sort", sort)
    params.set("page", String(page))
    params.set("limit", String(PAGE_SIZE))
    return params.toString()
  }, [search, category, location, sort, page])

  // Keep the URL shareable; filters live in the query string (plan §9.4).
  useEffect(() => {
    router.replace(`${pathname}?${query}`, { scroll: false })
  }, [router, pathname, query])

  // One request per filter/page change, debounced for typing.
  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      setFailed(false)
      try {
        const response = await fetch(`${PUBLIC_API_URL}/menu?${query}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("Menu request failed")

        const payload = (await response.json()) as ApiResponse<MenuItem[]>
        setItems(payload.data ?? [])
        setPagination(payload.meta?.pagination ?? EMPTY_PAGINATION)
      } catch (error) {
        if ((error as Error).name === "AbortError") return
        setItems([])
        setPagination(EMPTY_PAGINATION)
        setFailed(true)
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, reloadKey])

  // Location chips come from the public filters endpoint.
  useEffect(() => {
    let active = true
    fetch(`${PUBLIC_API_URL}/menu/filters`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then(
        (
          payload: ApiResponse<{
            locations: Array<{ value: string; count: number }>
          }> | null
        ) => {
          if (!active) return
          setLocations((payload?.data?.locations ?? []).map((item) => item.value))
        }
      )
      .catch(() => undefined)

    return () => {
      active = false
    }
  }, [])

  const resetFilters = useCallback(() => {
    setSearch("")
    setCategory("all")
    setLocation("")
    setSort("newest")
    setPage(1)
  }, [])

  const hasFilters = category !== "all" || Boolean(search || location)

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-[clamp(2rem,4vw,3rem)] leading-none tracking-tight">
            Browse Menu
          </h1>
          <p className="mt-3 max-w-xl text-muted-foreground">
            Every item here has been approved by an admin. Search by name,
            narrow by category or location, and sort by price.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-auto lg:grid-cols-[minmax(0,260px)_200px_190px]">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <HugeiconsIcon
              icon={SearchIcon}
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              aria-label="Search menu items"
              placeholder="Search pizzas…"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>

          <Select
            items={CATEGORY_ITEMS}
            value={category}
            onValueChange={(value) => {
              setCategory(String(value ?? "all"))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            items={SORT_ITEMS}
            value={sort}
            onValueChange={(value) => {
              setSort(asSortOption(String(value ?? "newest")))
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Newest first" />
            </SelectTrigger>
            <SelectContent>
              {SORT_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {locations.length > 0 && (
        <div className="mt-8 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Location
          </span>
          <Button
            size="sm"
            variant={location ? "outline" : "default"}
            onClick={() => {
              setLocation("")
              setPage(1)
            }}
          >
            All
          </Button>
          {locations.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={location === value ? "default" : "outline"}
              onClick={() => {
                setLocation(value)
                setPage(1)
              }}
            >
              {value}
            </Button>
          ))}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-[360px] rounded-xl" />
            ))}
          </div>
        ) : failed ? (
          <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <p className="text-base font-medium">Couldn&apos;t load the menu</p>
            <p className="max-w-md text-sm text-muted-foreground">
              The menu service did not respond. Check that the API is running,
              then try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => setReloadKey((key) => key + 1)}
            >
              <HugeiconsIcon icon={RefreshIcon} className="size-4" />
              Try again
            </Button>
          </Card>
        ) : items.length > 0 ? (
          <>
            <p className="mb-6 text-sm text-muted-foreground">
              {pagination.total} item{pagination.total === 1 ? "" : "s"} found
            </p>

            <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {items.map((item, index) => (
                <Reveal
                  key={item.id}
                  delay={Math.min(index * 0.04, 0.24)}
                >
                  <MenuItemCard item={item} />
                </Reveal>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-between gap-4">
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
        ) : (
          <EmptyState
            title={hasFilters ? "No items match" : "No approved items yet"}
            description={
              hasFilters
                ? "Try a different search term, category, or location."
                : "New menu items appear here after admin approval."
            }
            action={
              hasFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Reset filters
                </Button>
              ) : undefined
            }
          />
        )}
      </div>
    </div>
  )
}
