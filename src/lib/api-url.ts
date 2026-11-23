/** Base URL of the Express API (public value, safe on the server and client). */
export const PUBLIC_API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api"
).replace(/\/$/, "")

/**
 * Public, unauthenticated API read used by server components.
 * Returns null instead of throwing so a cold API or empty DB renders an
 * empty state rather than a crashed page.
 */
export async function fetchPublicApi<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${PUBLIC_API_URL}${path}`, {
      cache: "no-store",
    })
    if (!response.ok) return null

    const payload = (await response.json()) as { data?: T }
    return payload.data ?? null
  } catch {
    return null
  }
}
