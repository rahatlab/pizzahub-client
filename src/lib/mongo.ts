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
    serverSelectionTimeoutMS: 5000,
  })

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__pizzahubMongoClient = mongoClient
}

export const mongoDb = mongoClient.db(dbName)
