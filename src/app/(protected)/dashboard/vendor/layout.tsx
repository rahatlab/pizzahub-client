import { requireRole } from "@/lib/session"

export default async function VendorLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireRole("vendor")
  return <>{children}</>
}
