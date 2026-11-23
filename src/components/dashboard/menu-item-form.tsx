"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon, Cancel01Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { apiFetch } from "@/lib/api"
import { CATEGORIES } from "@/lib/constants"
import type { MenuItem } from "@/types"

const CATEGORY_ITEMS = CATEGORIES.map((value) => ({ value, label: value }))

export function MenuItemForm({
  item,
  onSaved,
}: {
  item?: MenuItem
  onSaved?: () => void
}) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)

  const [itemName, setItemName] = useState(item?.itemName ?? "")
  const [category, setCategory] = useState(item?.category ?? CATEGORIES[0])
  const [description, setDescription] = useState(item?.description ?? "")
  const [price, setPrice] = useState(item ? String(item.price) : "")
  const [location, setLocation] = useState(item?.location ?? "")
  const [images, setImages] = useState<string[]>(item?.images ?? [])

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImage = async (file: File) => {
    if (images.length >= 5) {
      toast.error("Up to 5 images per item.")
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      toast.error("Images must be 3MB or smaller.")
      return
    }

    setUploading(true)
    try {
      const form = new FormData()
      form.set("image", file)
      const response = await apiFetch<{ url: string }>("/upload/imgbb", {
        method: "POST",
        body: form,
      })
      const url = response.data?.url
      if (!url) throw new Error("Upload failed.")
      setImages((current) => [...current, url])
    } catch (uploadError) {
      toast.error(
        uploadError instanceof Error ? uploadError.message : "Upload failed."
      )
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ""
    }
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    if (images.length === 0) {
      setError("Add at least one image.")
      return
    }

    setSubmitting(true)
    const body = JSON.stringify({
      itemName: itemName.trim(),
      category,
      description: description.trim(),
      price: Number(price),
      location: location.trim(),
      images,
    })

    try {
      if (item) {
        await apiFetch(`/menu/${item.id}`, { method: "PATCH", body })
        toast.success("Menu item updated", {
          description:
            item.status === "rejected"
              ? "It is back in the admin review queue."
              : undefined,
        })
      } else {
        await apiFetch("/menu", { method: "POST", body })
        toast.success("Menu item submitted", {
          description: "An admin will review it before it appears publicly.",
        })
      }

      if (onSaved) {
        onSaved()
      } else {
        router.push("/dashboard/vendor/menu-items")
        router.refresh()
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not save the item."
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="item-name">Item name</Label>
          <Input
            id="item-name"
            value={itemName}
            onChange={(event) => setItemName(event.target.value)}
            placeholder="Margherita Classic"
            minLength={3}
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-category">Category</Label>
          <Select
            items={CATEGORY_ITEMS}
            value={category}
            onValueChange={(value) => setCategory(String(value))}
          >
            <SelectTrigger id="item-category" className="w-full">
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_ITEMS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="item-price">Price (USD)</Label>
          <Input
            id="item-price"
            type="number"
            min={0}
            max={100000}
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="12.99"
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="item-location">Location</Label>
          <Input
            id="item-location"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Gulshan, Dhaka"
            minLength={2}
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="item-description">Description</Label>
          <Textarea
            id="item-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="San Marzano tomato, fresh mozzarella, basil, olive oil."
            minLength={10}
            maxLength={2000}
            rows={4}
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Images (1–5, max 3MB each)</Label>
          <span className="text-xs text-muted-foreground">
            {images.length}/5
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {images.map((url) => (
            <div
              key={url}
              className="relative aspect-square overflow-hidden rounded-lg border border-border"
            >
              <Image src={url} alt="" fill sizes="120px" className="object-cover" />
              <button
                type="button"
                onClick={() =>
                  setImages((current) => current.filter((item) => item !== url))
                }
                aria-label="Remove image"
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-background/90 text-foreground"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
              </button>
            </div>
          ))}

          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border text-xs text-muted-foreground transition-colors hover:border-brand hover:text-brand disabled:opacity-60"
            >
              <HugeiconsIcon
                icon={uploading ? RefreshIcon : Add01Icon}
                className={`size-5 ${uploading ? "animate-spin" : ""}`}
              />
              {uploading ? "Uploading" : "Add image"}
            </button>
          )}
        </div>

        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void uploadImage(file)
          }}
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

      {!item && (
        <p className="text-xs text-muted-foreground">
          New items start as <strong>pending</strong> and become orderable only
          after an admin approves them.
        </p>
      )}

      <Button type="submit" disabled={submitting || uploading}>
        {submitting
          ? "Saving…"
          : item
            ? "Save changes"
            : "Submit for review"}
      </Button>
    </form>
  )
}
