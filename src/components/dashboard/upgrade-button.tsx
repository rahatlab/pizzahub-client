"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"

export function UpgradeButton({
  className,
  label = "Upgrade to Premium",
}: {
  className?: string
  label?: string
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const upgrade = async () => {
    setLoading(true)
    try {
      const response = await apiFetch<{ url: string }>(
        "/payment/create-checkout-session",
        { method: "POST" }
      )

      if (!response.data?.url) {
        throw new Error("Stripe did not return a checkout URL.")
      }

      window.location.href = response.data.url
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not start checkout."
      )
      setLoading(false)
      router.refresh()
    }
  }

  return (
    <Button size="lg" onClick={upgrade} disabled={loading} className={className}>
      {loading ? "Opening checkout…" : label}
      <HugeiconsIcon icon={ArrowUpRight01Icon} className="size-4" />
    </Button>
  )
}
