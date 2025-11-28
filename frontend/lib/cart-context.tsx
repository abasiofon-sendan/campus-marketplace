"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import type { CartItem } from "./types"

interface CartContextType {
  cart: CartItem[]
  addToCart: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getCartTotal: (products: any[]) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  // If authenticated, fetch server-side cart and merge it with local cart
  const { user } = useAuth()

  useEffect(() => {
    const fetchServerCart = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
        if (!token) {
          console.debug("No auth token found; skipping server cart fetch")
          return
        }
        const res = await fetch("https://market-api-5lg1.onrender.com/cart/cart-items/", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })
        console.debug("/cart/cart-items/ response status", res.status)
        const text = await res.text()
        let data: any = null
        try {
          data = text ? JSON.parse(text) : null
        } catch (parseErr) {
          console.warn("Failed to parse cart response as JSON, raw text:", text)
          data = text
        }
        console.log(data)

        console.debug("/cart/cart-items/ raw data:", data)

        // data is expected to be a list of cart items; handle several shapes
        if (Array.isArray(data)) {
          const serverItems: CartItem[] = data
            .map((it: any) => {
              // possible shapes: { id, product: 1 } or { product: { id: 1, ... } } or { product_id: 1 }
              const productIdRaw = it?.product?.id ?? it?.product ?? it?.product_id ?? it?.productId
              const quantityRaw = it?.quantity ?? it?.qty ?? 1
              if (!productIdRaw) return null
              return { productId: String(productIdRaw), quantity: Number(quantityRaw) || 1, serverId: String(it?.id ?? "") }
            })
            .filter(Boolean) as CartItem[]

          console.debug("Mapped server cart items:", serverItems)

          // merge: prefer server version for authenticated users
          setCart((prev) => {
            const byProduct = new Map<string, CartItem>()
            serverItems.forEach((si) => byProduct.set(si.productId, si))
            prev.forEach((p) => {
              if (!byProduct.has(p.productId)) byProduct.set(p.productId, p)
            })
            return Array.from(byProduct.values())
          })
        } else {
          console.debug("/cart/cart-items/ returned non-array data", data)
        }
      } catch (err) {
        console.error("Failed to fetch server cart:", err)
      }
    }

    // only fetch when a user is available (login may happen after initial mount)
    if (user && user.id) {
      fetchServerCart()
    }
  }, [user?.id])

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (productId: string, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId)
      if (existing) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [...prev, { productId, quantity }]
    })

    // sync with backend if user is authenticated
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (token) {
        // POST to cart endpoint and store serverId when created
        fetch("https://market-api-5lg1.onrender.com/cart/cart-items/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product: productId }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const text = await res.text()
              console.error("Failed to sync cart item to server:", res.status, text)
              return null
            }
            try {
              const created = await res.json()
              return created
            } catch (e) {
              return null
            }
          })
          .then((created) => {
            if (created && created.id) {
              // attach serverId to the corresponding local cart item
              setCart((prev) =>
                prev.map((it) => (it.productId === productId ? { ...it, serverId: String(created.id) } : it)),
              )
            }
          })
          .catch((err) => {
            console.error("Error syncing cart to server:", err)
          })
      }
    } catch (err) {
      console.error("Error starting cart sync:", err)
    }
  }

  const removeFromCart = (productId: string) => {
    // find possible serverId from current cart
    const existing = cart.find((c) => String(c.productId) === String(productId))
    const serverId = (existing as any)?.serverId

    // remove locally immediately
    setCart((prev) => prev.filter((item) => item.productId !== productId))

    // also attempt to remove server-side item
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
      if (!token) return

      const doDelete = async (id: string) => {
        try {
          const res = await fetch(`https://market-api-5lg1.onrender.com/cart/cart-items/${id}/`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) {
            const text = await res.text()
            console.error("Failed to delete server cart item:", res.status, text)
          }
        } catch (err) {
          console.error("Error deleting server cart item:", err)
        }
      }

      if (serverId) {
        void doDelete(serverId)
        return
      }

      // if we don't have serverId, fetch server list and delete matching product entry
      void (async () => {
        try {
          const res = await fetch("https://market-api-5lg1.onrender.com/cart/cart-items/", {
            headers: { Authorization: `Bearer ${token}` },
          })
          if (!res.ok) return
          const list = await res.json()
          const match = list.find((it: any) => String(it.product ?? it.product_id ?? it.productId) === String(productId))
          if (match && match.id) {
            await doDelete(match.id)
          }
        } catch (err) {
          console.error("Error finding server cart item to delete:", err)
        }
      })()
    } catch (err) {
      console.error("Error starting server delete:", err)
    }
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    setCart([])
  }

  const getCartTotal = (products: any[]) => {
    return cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
