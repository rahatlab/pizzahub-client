export type Role = "customer" | "vendor" | "admin"

export type SubscriptionPlan = "free" | "premium"

export type MenuStatus = "pending" | "approved" | "rejected" | "inactive"

export type OrderStatus = "pending" | "accepted" | "rejected" | "cancelled"

export type TransactionStatus = "pending" | "success" | "failed"

export interface CurrentUser {
  id: string
  name: string
  email: string
  image: string | null
  role: Role
  isBlocked: boolean
  businessName: string | null
  subscriptionPlan: SubscriptionPlan
  subscriptionExpiresAt: Date | null
  subscriptionCancelAtPeriodEnd: boolean
  stripeCustomerId: string | null
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
}

export interface ApiMeta {
  timestamp: string
  pagination?: Pagination
}

export interface ApiErrorDetail {
  field: string
  issue: string
}

export interface ApiResponse<T> {
  success: boolean
  message: string
  data?: T
  meta?: ApiMeta
  error?: {
    code: string
    details?: ApiErrorDetail[]
  }
}

export interface MenuItem {
  id: string
  vendorId: string
  itemName: string
  category: string
  description: string
  price: number
  location: string
  images: string[]
  status: MenuStatus
  rejectionReason?: string | null
  ratingAvg?: number
  ratingCount?: number
  vendor?: {
    id: string
    name: string
    businessName?: string | null
    image?: string | null
    subscriptionPlan?: SubscriptionPlan
    ratingAvg?: number
  }
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  itemId: string
  vendorId: string
  customerId: string
  itemName: string
  itemImage: string
  itemPrice: number
  vendorName: string
  deliveryDate: string
  deliveryAddress: string
  message?: string | null
  status: OrderStatus
  rejectionReason?: string | null
  createdAt: string
  updatedAt: string
}
