import "server-only"

import type { Db } from "mongodb"
import { mongoDb } from "./mongo"

/**
 * Shared MongoDB connection for the Next.js server.
 * Better Auth and server-side reads both use the same client.
 */
export function getDb(): Db {
  return mongoDb
}
