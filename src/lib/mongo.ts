import "server-only"

import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/pizzahub"
const dbName = process.env.MONGODB_DB || "pizzahub"

const globalForMongo = globalThis as unknown as {
  __pizzahubMongoClient?: MongoClient
}

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

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__pizzahubMongoClient = mongoClient
}

export const mongoDb = mongoClient.db(dbName)
