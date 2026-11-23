import type { Order, OrderStatus } from "@/types"

export type StatusCount<T extends string = OrderStatus> = {
  status: T
  count: number
}

export type CategoryCount = {
  category: string
  count: number
}

export type VendorDashboard = {
  stats: {
    totalItems: number
    activeItems: number
    pendingItems: number
    pendingOrders: number
    acceptedOrders: number
    rejectedOrders: number
    cancelledOrders: number
    totalOrders: number
  }
  ordersByStatus: StatusCount[]
  itemsByCategory: CategoryCount[]
  recentOrders: Order[]
}

export type CustomerDashboard = {
  stats: {
    totalOrders: number
    pending: number
    accepted: number
    rejected: number
    cancelled: number
  }
  ordersByStatus: StatusCount[]
  recentOrders: Order[]
}

export type AdminDashboard = {
  stats: {
    totalUsers: number
    customers: number
    vendors: number
    admins: number
    blockedUsers: number
    premiumVendors: number
    totalItems: number
    pendingItems: number
    approvedItems: number
    totalOrders: number
    pendingOrders: number
    transactions: number
    successfulTransactions: number
  }
  ordersByStatus: StatusCount[]
  itemsByCategory: CategoryCount[]
}

export type AdminUserDetail = {
  user: {
    id: string
    name: string
    email: string
    image: string | null
    role: "customer" | "vendor" | "admin"
    isBlocked: boolean
    businessName: string | null
    subscriptionPlan: "free" | "premium"
    createdAt: string | null
  }
  stats: {
    menuItems: number
    ordersPlaced: number
    ordersReceived: number
  }
}

export type PremiumState = {
  plan: "free" | "premium"
  premiumActive: boolean
  priceCents: number
  currency: string
}
