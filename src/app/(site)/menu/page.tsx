import type { Metadata } from "next"
import { Suspense } from "react"
import { MenuBrowser } from "@/components/menu/menu-browser"
import { MenuPageSkeleton } from "@/components/menu/menu-skeleton"

export const metadata: Metadata = {
  title: "Browse Menu",
  description:
    "Search approved pizza menu items by name, category, and location, then sort by price.",
}

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuPageSkeleton />}>
      <MenuBrowser />
    </Suspense>
  )
}
