import { z } from "zod"
import { CATEGORIES } from "./constants"

export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters.")
  .max(128, "Password is too long.")
  .regex(/[a-z]/, "Password must include a lowercase letter.")
  .regex(/[A-Z]/, "Password must include an uppercase letter.")

export const emailSchema = z.string().trim().email("Enter a valid email address.")

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["customer", "vendor"]),
})

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
})

export const menuItemSchema = z.object({
  itemName: z.string().trim().min(2).max(100),
  category: z.enum(CATEGORIES),
  description: z.string().trim().min(10).max(1000),
  price: z.coerce.number().min(0).max(100000),
  location: z.string().trim().min(2).max(120),
  images: z.array(z.string().url()).min(1).max(5),
})

export const orderSchema = z.object({
  itemId: z.string().min(1),
  deliveryDate: z.string().min(1, "Delivery date is required."),
  deliveryAddress: z.string().trim().min(5).max(300),
  message: z.string().trim().max(500).optional().or(z.literal("")),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type MenuItemInput = z.infer<typeof menuItemSchema>
export type OrderInput = z.infer<typeof orderSchema>
