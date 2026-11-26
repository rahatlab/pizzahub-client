import { toNextJsHandler } from "better-auth/next-js"
import { auth } from "@/lib/auth"
import { ensureMongoReady } from "@/lib/mongo"

const handlers = toNextJsHandler(auth)

/**
 * Better Auth reads Mongo straight through its adapter, so the cached client
 * is healed here too — a closed topology made every /api/auth call fail with
 * FAILED_TO_GET_SESSION until the serverless instance recycled.
 */
async function authHandler(request: Request) {
  await ensureMongoReady()
  return handlers.GET(request)
}

export const GET = authHandler
export const POST = authHandler
