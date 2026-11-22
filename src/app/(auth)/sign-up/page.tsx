import type { Metadata } from "next"
import { SignUpForm } from "@/components/forms/sign-up-form"

export const metadata: Metadata = {
  title: "Create Account",
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  return <SignUpForm redirectTo={params.redirect} />
}
