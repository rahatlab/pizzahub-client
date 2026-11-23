"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiFetch } from "@/lib/api"
import { authClient } from "@/lib/auth-client"
import type { CurrentUser } from "@/types"

export function ProfileForm({ user }: { user: CurrentUser }) {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)

  const [name, setName] = useState(user.name)
  const [image, setImage] = useState(user.image ?? "")
  const [businessName, setBusinessName] = useState(user.businessName ?? "")
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const uploadPhoto = async (file: File) => {
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
      setImage(url)
      toast.success("Photo ready", {
        description: "Save changes to update your profile.",
      })
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
    setSaving(true)

    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
        ...(user.role === "vendor"
          ? { businessName: businessName.trim() || null }
          : {}),
      })

      if (error) {
        throw new Error(error.message || "Could not save your profile.")
      }

      toast.success("Profile updated")
      router.refresh()
    } catch (saveError) {
      toast.error(
        saveError instanceof Error ? saveError.message : "Could not save."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative size-16 overflow-hidden rounded-full border border-border bg-muted">
          {image ? (
            <Image src={image} alt="" fill sizes="64px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-lg font-semibold text-muted-foreground">
              {(name || user.email).slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-sm font-medium">{name || "Your name"}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
            >
              {uploading ? "Uploading…" : image ? "Change photo" : "Upload photo"}
            </Button>
            {image ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploading}
                onClick={() => setImage("")}
              >
                Remove photo
              </Button>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or WebP, up to 3MB.
          </p>
        </div>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) void uploadPhoto(file)
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="profile-name">Full name</Label>
          <Input
            id="profile-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
        </div>

        {user.role === "vendor" ? (
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="profile-business">Business name</Label>
            <Input
              id="profile-business"
              value={businessName}
              onChange={(event) => setBusinessName(event.target.value)}
              placeholder="Nonna's Kitchen"
              maxLength={120}
            />
            <p className="text-xs text-muted-foreground">
              Shown to customers instead of your personal name.
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 rounded-xl border border-border bg-surface/50 p-4 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Email
          </p>
          <p className="mt-1 truncate text-sm">{user.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Role
          </p>
          <p className="mt-1">
            <Badge variant="secondary" className="capitalize">
              {user.role}
            </Badge>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Plan
          </p>
          <p className="mt-1">
            <Badge
              variant={user.subscriptionPlan === "premium" ? "default" : "outline"}
              className="capitalize"
            >
              {user.subscriptionPlan}
            </Badge>
          </p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Role and plan cannot be changed here. Premium is activated only by the
        Stripe webhook.
      </p>

      <Button type="submit" disabled={saving || uploading}>
        {saving ? "Saving…" : "Save changes"}
      </Button>
    </form>
  )
}
