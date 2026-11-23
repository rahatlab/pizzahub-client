"use client"

export function SessionProviderWrapper({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // better-auth v1 client manages session via authClient.useStore internally;
  // no React provider is required. Components call authClient.useSession() directly.
  return <>{children}</>
}
