"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/forms/password-input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card"

export function SignInForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [pending, setPending] = useState(false)
  const [googlePending, setGooglePending] = useState(false)

  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/dashboard"

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)

    const { error } = await authClient.signIn.email({
      email: email.trim(),
      password,
    })

    if (error) {
      toast.error(error.message || "Could not sign in. Check your details.")
      setPending(false)
      return
    }

    toast.success("Welcome back.")
    router.push(safeRedirect)
    router.refresh()
  }

  async function onGoogle() {
    setGooglePending(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: safeRedirect,
    })

    if (error) {
      toast.error(error.message || "Google sign-in is not available right now.")
      setGooglePending(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-border bg-card/95 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <CardHeader className="gap-1.5">
        <h1 className="font-display text-2xl leading-none tracking-tight">
          Welcome back
        </h1>
        <CardDescription>
          Sign in to order, manage your kitchen, or review the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Your password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            or
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          onClick={onGoogle}
          disabled={googlePending}
        >
          {googlePending ? "Opening Google..." : "Continue with Google"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          New to PizzaHub?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-brand hover:underline"
          >
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
