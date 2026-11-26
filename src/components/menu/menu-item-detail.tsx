"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  LocationIcon,
  Pizza01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PremiumBadge } from "@/components/menu/premium-badge"
import { apiFetch } from "@/lib/api"
import type { MenuItem, Role } from "@/types"

function todayIso(): string {
  const now = new Date()
  const offset = now.getTimezoneOffset() * 60_000
  return new Date(now.getTime() - offset).toISOString().slice(0, 10)
}

/** First two words' initials for the vendor avatar fallback. */
function nameInitials(label: string): string {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
}

export function MenuItemDetail({
  item,
  viewer,
}: {
  item: MenuItem
  viewer: { id: string; name: string; role: Role }
}) {
  const images = item.images ?? []
  const [activeImage, setActiveImage] = useState(0)

  const isOwnItem = item.vendorId === viewer.id
  const isAdmin = viewer.role === "admin"

  const orderBlockedReason = isAdmin
    ? "Admins review and moderate orders — they cannot place them."
    : isOwnItem
      ? "You can't order your own menu item."
      : null

  return (
    <div className="mx-auto w-full max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <Button
        variant="outline"
        size="sm"
        className="mb-6"
        render={<Link href="/menu" />}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        Back to menu
      </Button>

      <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-3">
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-surface">
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={item.itemName}
                fill
                priority
                sizes="(min-width: 1024px) 55vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <HugeiconsIcon icon={Pizza01Icon} className="size-10" />
              </div>
            )}
            {item.vendor?.subscriptionPlan === "premium" && (
              <div className="absolute left-3 top-3">
                <PremiumBadge />
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={index === activeImage}
                  className={`relative aspect-square overflow-hidden rounded-lg border transition-colors ${
                    index === activeImage
                      ? "border-brand"
                      : "border-border hover:border-border-strong"
                  }`}
                >
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <Badge variant="secondary">{item.category}</Badge>
            <h1 className="font-display text-[clamp(1.75rem,3.4vw,2.5rem)] leading-none tracking-tight">
              {item.itemName}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <HugeiconsIcon icon={LocationIcon} className="size-4" />
                {item.location}
              </span>
              <span className="text-lg font-semibold tabular-nums text-brand">
                ${item.price.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="leading-relaxed text-muted-foreground">
            {item.description}
          </p>

          <Card className="flex items-center gap-3 p-5">
            <Avatar size="lg">
              {item.vendor?.image ? (
                <AvatarImage
                  src={item.vendor.image}
                  alt={
                    item.vendor.businessName || item.vendor.name || "Kitchen"
                  }
                />
              ) : null}
              <AvatarFallback>
                {nameInitials(
                  item.vendor?.businessName || item.vendor?.name || ""
                ) || <HugeiconsIcon icon={Store01Icon} className="size-5" />}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {item.vendor?.businessName || item.vendor?.name || "Kitchen"}
              </p>
              {item.vendor?.businessName && item.vendor.name ? (
                <p className="truncate text-xs text-muted-foreground">
                  {item.vendor.name}
                </p>
              ) : null}
            </div>
            {item.vendor?.subscriptionPlan === "premium" && <PremiumBadge />}
          </Card>

          {orderBlockedReason ? (
            <div className="space-y-2">
              <Button size="lg" className="w-full" disabled>
                Place Order
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                {orderBlockedReason}
              </p>
            </div>
          ) : (
            <OrderDialog item={item} viewer={viewer} />
          )}
        </div>
      </div>
    </div>
  )
}

function OrderDialog({
  item,
  viewer,
}: {
  item: MenuItem
  viewer: { name: string }
}) {
  const [open, setOpen] = useState(false)
  const [deliveryDate, setDeliveryDate] = useState(todayIso())
  const [deliveryAddress, setDeliveryAddress] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const vendorLabel =
    item.vendor?.businessName || item.vendor?.name || "PizzaHub"
  const cardholder = viewer.name.trim() || "Guest"

  const canSubmit =
    !submitting &&
    deliveryDate.length > 0 &&
    deliveryAddress.trim().length >= 5

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await apiFetch("/orders", {
        method: "POST",
        body: JSON.stringify({
          itemId: item.id,
          deliveryDate,
          deliveryAddress: deliveryAddress.trim(),
          ...(message.trim() ? { message: message.trim() } : {}),
        }),
      })

      setOpen(false)
      setDeliveryDate(todayIso())
      setDeliveryAddress("")
      setMessage("")
      toast.success("Order placed", {
        description: `${item.itemName} is pending vendor approval.`,
      })
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not place the order. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button size="lg" className="w-full" />}
      >
        Place Order
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            {item.itemName} · ${item.price.toFixed(2)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Decorative card preview — brand detail only, no payment happens here. */}
          <div
            aria-hidden="true"
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1e1e20] via-[#141416] to-[#0a0a0b] p-5 shadow-[0_12px_32px_-16px_rgba(0,0,0,0.9)]"
          >
            <div className="pointer-events-none absolute -right-10 -top-12 size-36 rounded-full bg-brand/30 blur-3xl" />
            <div className="relative space-y-5">
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-brand">
                  {vendorLabel}
                </p>
                <span className="mt-0.5 h-7 w-9 shrink-0 rounded-[5px] bg-gradient-to-br from-[#f6e7ad] to-[#b8860b]" />
              </div>
              <p className="text-[clamp(0.8rem,4vw,1.125rem)] tracking-[0.2em] text-white/90 sm:tracking-[0.25em]">
                0000 0000 0000 0000
              </p>
              <div className="flex items-end justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                    Card holder
                  </p>
                  <p className="truncate text-sm font-medium text-white/90">
                    {cardholder}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">
                    Valid thru
                  </p>
                  <p className="text-sm font-medium tabular-nums text-white/90">
                    12/29
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery-date">Delivery date</Label>
            <Input
              id="delivery-date"
              type="date"
              min={todayIso()}
              value={deliveryDate}
              onChange={(event) => setDeliveryDate(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="delivery-address">Delivery address</Label>
            <Input
              id="delivery-address"
              placeholder="Road 11, Banani, Dhaka"
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              minLength={5}
              maxLength={300}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-message">Message (optional)</Label>
            <Textarea
              id="order-message"
              placeholder="Anything the kitchen should know?"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {submitting ? "Placing…" : "Confirm order"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
