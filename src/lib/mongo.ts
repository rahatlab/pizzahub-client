import "server-only"

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/pizzahub"
const dbName = process.env.MONGODB_DB || "pizzahub"

const globalForMongo = globalThis as unknown as {
  __pizzahubMongoClient?: MongoClient
}

/**
 * One client per process in every environment: route bundles that import this
 * module separately (and dev HMR re-imports) must reuse a single connection
 * pool instead of opening a second one against Atlas.
 */
export const mongoClient =
  globalForMongo.__pizzahubMongoClient ??
  new MongoClient(uri, {
    maxPoolSize: 5,
    // Serverless cold starts over Atlas SRV take longer than a few seconds on
    // the first connection; a short selection timeout made every auth request
    // fail with MongoTopologyClosedError.
    serverSelectionTimeoutMS: 30000,
    connectTimeoutMS: 30000,
  })

globalForMongo.__pizzahubMongoClient = mongoClient

type TopologyLike = {
  isConnected(): boolean
}

/**
 * Self-heals the cached client when its topology was closed underneath the
 * instance (idle freeze, dropped pool). The driver never reconnects a closed
 * topology — `autoConnect` only connects while `topology == null` — so every
 * later query failed with MongoTopologyClosedError until the instance
 * recycled. `connect()` swaps in a fresh topology (its internal
 * `connectionLock` serializes concurrent attempts), so calling it again
 * restores the pool from any request path.
 */
export async function ensureMongoReady(): Promise<void> {
  const topology = (
    mongoClient as unknown as { topology?: TopologyLike }
  ).topology

  // No topology yet means the client has never connected; the first query
  // connects lazily on its own, so there is nothing to heal.
  if (!topology || topology.isConnected()) return

  try {
    await mongoClient.connect()
  } catch (error) {
    // Swallow: the operation that triggered this heal surfaces the real error.
    console.warn("[mongo] reconnect failed:", error)
  }
}

export const mongoDb = mongoClient.db(dbName)
