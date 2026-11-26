import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { fetchPublicApi } from "@/lib/api-url"
import { MenuItemDetail } from "@/components/menu/menu-item-detail"
import type { MenuItem } from "@/types"

export const metadata: Metadata = {
  title: "Item Details",
}

/**
 * Item details is a private route (plan §3 #10): signed-out visitors are sent
 * to sign-in with a redirect back here, blocked accounts go to /blocked.
 */
export default async function MenuItemPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const user = await getCurrentUser()
  if (!user) {
    redirect(`/sign-in?redirect=${encodeURIComponent(`/menu/${id}`)}`)
  }
  if (user.isBlocked) {
    redirect("/blocked")
  }

  const item = await fetchPublicApi<MenuItem>(`/menu/${id}`)
  if (!item) {
    notFound()
  }

  return (
    <MenuItemDetail
      item={item}
      viewer={{ id: user.id, name: user.name, role: user.role }}
    />
  )
}
