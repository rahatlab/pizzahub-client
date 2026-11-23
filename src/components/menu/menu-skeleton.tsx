import { Skeleton } from "@/components/ui/skeleton"

/** Skeleton that mirrors the browse-menu layout: heading, filters, cards. */
export function MenuPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading menu"
      className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
    >
      <Skeleton className="h-10 w-56" />
      <Skeleton className="mt-3 h-5 w-80 max-w-full" />

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Skeleton className="h-11 w-full sm:max-w-sm" />
        <Skeleton className="h-11 w-full sm:w-48" />
        <Skeleton className="h-11 w-full sm:w-48" />
        <Skeleton className="h-11 w-full sm:w-44" />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-xl border border-border bg-card"
          >
            <Skeleton className="aspect-video w-full rounded-none" />
            <div className="space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-40 max-w-full" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-3 w-full" />
              <div className="flex items-center justify-between gap-2 pt-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
