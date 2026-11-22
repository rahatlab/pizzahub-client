"use client"

import { authClient } from "./auth-client"
import type { ApiResponse } from "@/types"

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://localhost:5000/api"

type TokenCache = {
  token: string
  expiresAt: number
}

let tokenCache: TokenCache | null = null

export class ApiClientError extends Error {
  status: number
  code: string
  details?: Array<{ field: string; issue: string }>

  constructor(
    message: string,
    status = 500,
    code = "CLIENT_ERROR",
    details?: Array<{ field: string; issue: string }>
  ) {
    super(message)
    this.name = "ApiClientError"
    this.status = status
    this.code = code
    this.details = details
  }
}

function jwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    ) as { exp?: number }
    return typeof payload.exp === "number"
      ? payload.exp * 1000
      : Date.now() + 10 * 60 * 1000
  } catch {
    return Date.now() + 10 * 60 * 1000
  }
}

async function getApiToken(force = false): Promise<string> {
  if (!force && tokenCache && tokenCache.expiresAt > Date.now() + 30_000) {
    return tokenCache.token
  }

  const result = await authClient.token()
  const token = result.data?.token

  if (result.error || !token) {
    throw new ApiClientError(
      "Your session expired. Please sign in again.",
      401,
      "UNAUTHORIZED"
    )
  }

  tokenCache = { token, expiresAt: jwtExpiry(token) }
  return token
}

function authHeaders(token: string, init?: RequestInit): Headers {
  const headers = new Headers(init?.headers)
  headers.set("Authorization", `Bearer ${token}`)

  const isFormData =
    typeof FormData !== "undefined" && init?.body instanceof FormData

  if (init?.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return headers
}

async function handleBlockedAccount() {
  tokenCache = null
  await authClient.signOut().catch(() => undefined)

  if (typeof window !== "undefined") {
    window.location.replace(`${window.location.origin}/blocked`)
  }
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retryOnUnauthorized = true
): Promise<ApiResponse<T>> {
  const token = await getApiToken()
  const url = path.startsWith("http")
    ? path
    : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`

  const response = await fetch(url, {
    ...init,
    headers: authHeaders(token, init),
    cache: "no-store",
  })

  const text = await response.text()
  let payload: ApiResponse<T>

  try {
    payload = JSON.parse(text) as ApiResponse<T>
  } catch {
    throw new ApiClientError(
      "The server returned an unexpected response.",
      response.status,
      "INVALID_RESPONSE"
    )
  }

  if (response.status === 401 && retryOnUnauthorized) {
    tokenCache = null
    return apiFetch<T>(path, init, false)
  }

  if (!response.ok || payload.success === false) {
    if (payload.error?.code === "ACCOUNT_BLOCKED") {
      await handleBlockedAccount()
    }

    throw new ApiClientError(
      payload.message || "Request failed.",
      response.status,
      payload.error?.code ?? "REQUEST_FAILED",
      payload.error?.details
    )
  }

  return payload
}

export function clearApiTokenCache() {
  tokenCache = null
}

export { API_BASE }
