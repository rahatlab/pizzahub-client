import Link from "next/link"

export function CategoryTile({
  category,
}: {
  category: { value: string; count: number }
}) {
  return (
    <Link
      href={`/menu?category=${encodeURIComponent(category.value)}`}
      className="group flex h-full min-h-[104px] flex-col justify-between gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand"
    >
      <span className="text-sm font-medium leading-snug">
        {category.value}
      </span>
      <span className="text-xs text-muted-foreground transition-colors group-hover:text-brand">
        {category.count} item{category.count === 1 ? "" : "s"}
      </span>
    </Link>
  )
}
