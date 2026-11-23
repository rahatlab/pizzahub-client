import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Pizza01Icon } from "@hugeicons/core-free-icons"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { PremiumBadge } from "@/components/menu/premium-badge"
import type { MenuItem } from "@/types"

/**
 * One menu card for both the home featured row and the browse grid.
 * `featured` only adds the Featured badge; premium comes from the vendor.
 */
export function MenuItemCard({
  item,
  featured = false,
}: {
  item: MenuItem
  featured?: boolean
}) {
  const image = item.images?.[0]
  const isPremium = item.vendor?.subscriptionPlan === "premium"
  const vendorName = item.vendor?.businessName || item.vendor?.name

  return (
    <Card className="group h-full gap-0 overflow-hidden p-0 transition-colors hover:border-border-strong">
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        {image ? (
          <Image
            src={image}
            alt={item.itemName}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 92vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <HugeiconsIcon icon={Pizza01Icon} className="size-9" />
          </div>
        )}
        {(featured || isPremium) && (
          <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {featured && (
              <Badge className="uppercase tracking-[0.1em]">Featured</Badge>
            )}
            {isPremium && <PremiumBadge />}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className="max-w-[70%] truncate">
            {item.category}
          </Badge>
          <span className="truncate text-xs text-muted-foreground">
            {item.location}
          </span>
        </div>

        <h3 className="line-clamp-1 font-semibold">{item.itemName}</h3>
        <p className="truncate text-xs text-muted-foreground">{vendorName}</p>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <span className="text-lg font-semibold tabular-nums text-brand">
            ${item.price.toFixed(2)}
          </span>
          <Link
            href={`/menu/${item.id}`}
            className="shrink-0 text-xs font-medium text-muted-foreground transition-colors hover:text-brand"
          >
            View details
          </Link>
        </div>
      </div>
    </Card>
  )
}
