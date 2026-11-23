"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle02Icon,
  ClockIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { buttonVariants } from "@/components/ui/button"
import { apiFetch } from "@/lib/api"
import type { PremiumState } from "@/types/dashboard"

const MAX_ATTEMPTS = 20
const INTERVAL_MS = 3000

export function PremiumPoll() {
  const [state, setState] = useState<PremiumState | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    let active = true
    let timer: ReturnType<typeof setTimeout> | undefined

    const check = async () => {
      setChecking(true)
      try {
        const response = await apiFetch<PremiumState>("/payment/subscription")
        if (!active) return

        const next = response.data ?? null
        setState(next)
        setAttempts((current) => current + 1)

        if (next?.premiumActive) {
          toast.success("Premium is active", {
            description: "The Stripe webhook confirmed your payment.",
          })
          return
        }
      } catch {
        // A failed poll is not an activation failure — keep trying.
        if (active) setAttempts((current) => current + 1)
      } finally {
        if (active) setChecking(false)
      }

      if (active) timer = setTimeout(check, INTERVAL_MS)
    }

    void check()

    return () => {
      active = false
      if (timer) clearTimeout(timer)
    }
  }, [])

  if (state?.premiumActive) {
    return (
      <div className="space-y-5 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/15 text-brand">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-2xl">Premium is active</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Unlimited items, featured placement, and the Premium badge are now
            enabled on your vendor account.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/dashboard/vendor/menu-items"
            className={buttonVariants({ size: "sm" })}
          >
            Manage menu
          </Link>
          <Link
            href="/dashboard/vendor/overview"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Back to overview
          </Link>
        </div>
      </div>
    )
  }

  const gaveUp = attempts >= MAX_ATTEMPTS

  return (
    <div className="space-y-5 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-muted text-muted-foreground">
        <HugeiconsIcon
          icon={gaveUp ? RefreshIcon : ClockIcon}
          className="size-6"
        />
      </span>
      <div>
        <h1 className="font-display text-2xl">
          {gaveUp ? "Still waiting for confirmation" : "Confirming your payment"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {gaveUp
            ? "Stripe has not confirmed this payment yet. Premium activates automatically once the webhook arrives — you can safely leave this page."
            : "This page checks your subscription state. Premium is never activated here; only the Stripe webhook can enable it."}
        </p>
      </div>
      {checking ? (
        <p className="text-xs text-muted-foreground">
          Checking… ({Math.min(attempts, MAX_ATTEMPTS)}/{MAX_ATTEMPTS})
        </p>
      ) : null}
      <Link
        href="/dashboard/vendor/subscription"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        Back to Premium
      </Link>
    </div>
  )
}
