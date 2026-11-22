import type { MenuStatus, OrderStatus, Role } from "@/types"

export const APP_NAME = "PizzaHub"

export const ROLES: Role[] = ["customer", "vendor", "admin"]

export const CATEGORIES = [
  "Classic Pizzas",
  "Vegetarian Pizzas",
  "Meat Lovers",
  "Specialty / Gourmet Pizzas",
  "Sides & Appetizers",
  "Beverages & Desserts",
] as const

export type Category = (typeof CATEGORIES)[number]

export const MENU_STATUSES: MenuStatus[] = [
  "pending",
  "approved",
  "rejected",
  "inactive",
]

export const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "rejected",
  "cancelled",
]

export const MENU_STATUS_LABELS: Record<MenuStatus, string> = {
  pending: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  inactive: "Inactive",
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  cancelled: "Cancelled",
}

export const FREE_PLAN_ITEM_LIMIT = 3
export const PREMIUM_PLAN_PRICE_CENTS = 999
export const PREMIUM_PLAN_CURRENCY = "usd"

export const DASHBOARD_PATH: Record<Role, string> = {
  vendor: "/dashboard/vendor/overview",
  customer: "/dashboard/customer/overview",
  admin: "/dashboard/admin/overview",
}
