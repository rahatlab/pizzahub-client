import { requireUser } from "@/lib/session"

export default async function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireUser()
  return <>{children}</>
}
