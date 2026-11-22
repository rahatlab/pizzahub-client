"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"

export function SignOutButton() {
  const router = useRouter()
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    const { error } = await authClient.signOut()

    if (error) {
      toast.error(error.message || "Could not sign out.")
      setPending(false)
      return
    }

    router.push("/sign-in")
    router.refresh()
  }

  return (
    <Button variant="outline" onClick={signOut} disabled={pending}>
      {pending ? "Signing out..." : "Sign out"}
    </Button>
  )
}
