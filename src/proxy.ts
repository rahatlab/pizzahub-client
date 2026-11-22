import { NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

const PROTECTED_PREFIXES = ["/dashboard", "/profile-settings", "/payment"]

/**
 * Optimistic guard only. The real session, role, and blocked checks run in
 * server layouts/pages via `getCurrentUser` / `requireRole`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )

  if (!isProtected) return NextResponse.next()

  const sessionCookie = getSessionCookie(request)
  if (sessionCookie) return NextResponse.next()

  const signInUrl = new URL("/sign-in", request.url)
  signInUrl.searchParams.set("redirect", `${pathname}${search}`)
  return NextResponse.redirect(signInUrl)
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile-settings", "/payment/:path*"],
}
