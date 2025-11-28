export interface User {
  id: string
  email: string
  name: string
  role: "vendor" | "buyer"
  walletBalance: number
  avatar?: string
  createdAt: Date
}

export interface Product {
  id: string
  vendorId: string
  vendor_name: string
  product_name: string
  description: string
  price: number
  category: string
  image_url: string // Keep for backward compatibility
  images: string[] // Multiple images for slider
  stock: number
  sold: number
  createdAt: Date
}

export interface CartItem {
  productId: string
  quantity: number
  serverId?: string
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: "credit" | "debit"
  description: string
  createdAt: Date
}

export interface Order {
  id: string
  customerId: string
  vendorId: string
  products: { productId: string; quantity: number; price: number }[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: Date
}

export type Category = "Electronics" | "Fashion" | "Books" | "Food" | "Services" | "Other"


export interface Purchase {
  id: string
  customerId: string
  vendorId: string
  productId: string
  createdAt: Date
  amount: number
}