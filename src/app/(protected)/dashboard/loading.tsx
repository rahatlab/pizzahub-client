import { Skeleton } from "@/components/ui/skeleton"

/** Skeleton for dashboard pages: page header, stat cards, panels, table rows. */
export default function DashboardLoading() {
  return (
    <div aria-busy="true" aria-label="Loading dashboard">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-border bg-card p-5"
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-7 w-16" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>

      <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-4">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}
