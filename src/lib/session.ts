import "server-only"

import { ObjectId } from "mongodb"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "./auth"
import { getDb } from "./db"
import { ensureMongoReady } from "./mongo"
import type { CurrentUser, Role } from "@/types"

type UserDocument = {
  _id: ObjectId | string
  name?: string
  email?: string
  image?: string | null
  role?: string
  isBlocked?: boolean
  businessName?: string | null
  subscriptionPlan?: string
  subscriptionExpiresAt?: Date | null
  subscriptionCancelAtPeriodEnd?: boolean
  stripeCustomerId?: string | null
}

function userFilter(id: string) {
  return ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : { _id: id }
}

function mapUser(doc: UserDocument): CurrentUser {
  const role: Role =
    doc.role === "vendor" || doc.role === "admin" ? doc.role : "customer"

  return {
    id: String(doc._id),
    name: doc.name ?? "",
    email: doc.email ?? "",
    image: doc.image ?? null,
    role,
    isBlocked: Boolean(doc.isBlocked),
    businessName: doc.businessName ?? null,
    subscriptionPlan:
      doc.subscriptionPlan === "premium" ? "premium" : "free",
    subscriptionExpiresAt:
      doc.subscriptionExpiresAt instanceof Date
        ? doc.subscriptionExpiresAt
        : null,
    subscriptionCancelAtPeriodEnd: Boolean(
      doc.subscriptionCancelAtPeriodEnd
    ),
    stripeCustomerId: doc.stripeCustomerId ?? null,
  }
}

export async function getSession() {
  // Better Auth's adapter hits Mongo directly; heal a closed topology first.
  await ensureMongoReady()
  return auth.api.getSession({
    headers: await headers(),
  })
}

/**
 * Reads the fresh user document from Mongo so role, blocked status, and
 * subscription state are never trusted from stale client state.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession()
  if (!session) return null

  const doc = await getDb()
    .collection<UserDocument>("users")
    .findOne(userFilter(session.user.id))

  if (!doc) return null
  return mapUser(doc)
}

export async function requireUser(
  redirectPath = "/dashboard"
): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/sign-in?redirect=${encodeURIComponent(redirectPath)}`)
  }

  if (user.isBlocked) {
    redirect("/blocked")
  }

  return user
}

export async function requireRole(role: Role): Promise<CurrentUser> {
  const user = await requireUser()

  if (user.role !== role) {
    redirect("/unauthorized")
  }

  return user
}
