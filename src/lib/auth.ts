import "server-only"

import { betterAuth } from "better-auth"
import { mongodbAdapter } from "@better-auth/mongo-adapter"
import { jwt } from "better-auth/plugins"
import { nextCookies } from "better-auth/next-js"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { mongoClient, mongoDb } from "./mongo"

const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"

// Better Auth requires a secret in production. The fallback keeps local builds
// working; production must set BETTER_AUTH_SECRET.
const secret =
  process.env.BETTER_AUTH_SECRET ??
  "dev-only-change-me-please-32-characters-minimum-0001"

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }
    : null

export const auth = betterAuth({
  appName: "PizzaHub",
  baseURL: appUrl,
  secret,
  trustedOrigins: [appUrl],

  database: mongodbAdapter(mongoDb, { client: mongoClient }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
    maxPasswordLength: 128,
  },

  ...(googleProvider
    ? {
        socialProviders: {
          google: googleProvider,
        },
      }
    : {}),

  user: {
    modelName: "users",
    additionalFields: {
      // Public signup may choose customer/vendor, never admin.
      role: {
        type: ["customer", "vendor"],
        required: false,
        defaultValue: "customer",
        input: true,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      businessName: {
        type: "string",
        required: false,
        input: true,
      },
      subscriptionPlan: {
        type: ["free", "premium"],
        required: false,
        defaultValue: "free",
        input: false,
      },
      subscriptionExpiresAt: {
        type: "date",
        required: false,
        input: false,
      },
      subscriptionCancelAtPeriodEnd: {
        type: "boolean",
        required: false,
        defaultValue: false,
        input: false,
      },
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },

  databaseHooks: {
    user: {
      update: {
        before: async (data) => {
          // Users may edit name/image/businessName, but never their own role.
          if (data && typeof data === "object" && "role" in data) {
            throw new APIError("BAD_REQUEST", {
              message: "Role cannot be changed from profile settings.",
            })
          }
        },
      },
    },
  },

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const passwordPaths = new Set([
        "/sign-up/email",
        "/change-password",
        "/reset-password",
      ])

      if (!passwordPaths.has(ctx.path)) return

      const body = ctx.body as
        | { password?: string; newPassword?: string }
        | undefined

      const password = body?.password ?? body?.newPassword
      if (
        typeof password === "string" &&
        (!/[a-z]/.test(password) || !/[A-Z]/.test(password))
      ) {
        throw new APIError("BAD_REQUEST", {
          message: "Password must include an uppercase and a lowercase letter.",
        })
      }
    }),
  },

  plugins: [
    jwt({
      jwt: {
        issuer: appUrl,
        audience: appUrl,
        expirationTime: "15m",
        definePayload: ({ user }) => ({
          role: (user as { role?: string }).role ?? "customer",
          email: user.email,
          name: user.name,
        }),
      },
    }),
    // Must be the last plugin: makes Better Auth set cookies from Next handlers.
    nextCookies(),
  ],
})
