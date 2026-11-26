// Temporary verification helper — deleted after use.
const fs = require("fs")
const { MongoClient } = require("mongodb")

const env = Object.fromEntries(
  fs
    .readFileSync(".env", "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=")
      return [l.slice(0, i), l.slice(i + 1)]
    })
)

const uri = env.MONGODB_URI
const dbName = env.MONGODB_DB || env.MONGODB_DB_NAME || "pizzahub"

async function main() {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 })
  await client.connect()

  let dbs = []
  try {
    const res = await client.db("admin").command({ listDatabases: 1 })
    dbs = res.databases.map((d) => d.name)
  } catch {
    dbs = [dbName]
  }
  console.log("databases:", dbs.join(", "))

  for (const name of dbs) {
    if (name === "admin" || name === "local" || name === "config") continue
    let docs = []
    try {
      docs = await client
        .db(name)
        .collection("users")
        .find({ image: /lh3\.googleusercontent\.com/ })
        .project({ name: 1, email: 1, image: 1 })
        .limit(5)
        .toArray()
    } catch {
      continue
    }
    for (const d of docs) {
      console.log(`[${name}]`, d.name, "|", d.email, "|", d.image)
    }
  }
  await client.close()
}

main().catch((e) => {
  console.error("ERROR:", e.message)
  process.exit(1)
})
