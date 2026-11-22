import type { Metadata } from "next"
import { SignInForm } from "@/components/forms/sign-in-form"

export const metadata: Metadata = {
  title: "Sign In",
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  return <SignInForm redirectTo={params.redirect ?? "/dashboard"} />
}
