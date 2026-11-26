import "server-only"

import { headers } from "next/headers"
import { auth } from "./auth"
import { ensureMongoReady } from "./mongo"
import type { ApiResponse } from "@/types"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000/api"

/**
 * Server-side fetch helper for RSC loaders. The short-lived JWT is minted
 * from the incoming Better Auth session cookie.
 */
export async function serverApiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResponse<T>> {
  await ensureMongoReady()
  const result = await auth.api.getToken({
    headers: await headers(),
  })

  if (!result?.token) {
    throw new Error("No authenticated session for this request.")
  }

  const response = await fetch(
    `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`,
    {
      ...init,
      headers: {
        ...Object.fromEntries(new Headers(init.headers).entries()),
        Authorization: `Bearer ${result.token}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
      cache: "no-store",
    }
  )

  const payload = (await response.json()) as ApiResponse<T>

  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || "Request failed.")
  }

  return payload
}
