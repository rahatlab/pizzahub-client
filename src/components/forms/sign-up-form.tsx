"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { DASHBOARD_PATH } from "@/lib/constants"
import { passwordSchema } from "@/lib/validators"
import { cn } from "@/lib/utils"
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

type Role = "customer" | "vendor"

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("customer")
  const [pending, setPending] = useState(false)
  const [googlePending, setGooglePending] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const passwordCheck = passwordSchema.safeParse(password)
    if (!passwordCheck.success) {
      toast.error(passwordCheck.error.issues[0]?.message ?? "Check your password.")
      return
    }

    setPending(true)
    const { error } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      role,
    })

    if (error) {
      toast.error(error.message || "Could not create your account.")
      setPending(false)
      return
    }

    toast.success("Account created. Let’s get you set up.")
    const destination = redirectTo?.startsWith("/")
      ? redirectTo
      : DASHBOARD_PATH[role]
    router.push(destination)
    router.refresh()
  }

  async function onGoogle() {
    setGooglePending(true)
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: redirectTo?.startsWith("/") ? redirectTo : "/dashboard",
    })

    if (error) {
      toast.error(error.message || "Google sign-in is not available right now.")
      setGooglePending(false)
    }
  }

  return (
    <Card className="w-full max-w-lg border-border bg-card/95 shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
      <CardHeader className="gap-1.5">
        <h1 className="font-display text-2xl leading-none tracking-tight">
          Create your account
        </h1>
        <CardDescription>
          Order from local kitchens or open your own PizzaHub storefront.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Your full name"
              autoComplete="name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

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
              placeholder="At least 6 characters"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              At least 6 characters, with one uppercase and one lowercase
              letter.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Account type</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <RoleCard
                active={role === "customer"}
                title="Customer"
                description="Browse and order pizza."
                onClick={() => setRole("customer")}
              />
              <RoleCard
                active={role === "vendor"}
                title="Vendor"
                description="Manage a pizza kitchen."
                onClick={() => setRole("vendor")}
              />
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Creating account..." : "Create account"}
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
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="font-semibold text-brand hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

function RoleCard({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-lg border p-4 text-left transition-colors",
        active
          ? "border-brand bg-brand/10"
          : "border-border bg-background/40 hover:border-border-strong"
      )}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
        {description}
      </span>
    </button>
  )
}
