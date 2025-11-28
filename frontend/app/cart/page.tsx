"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { mockProducts } from "@/lib/mock-data"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const { user, isLoading } = useAuth()
  const { cart, updateQuantity, removeFromCart, clearCart, getCartTotal } = useCart()
  const router = useRouter()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set(cart.map((item) => item.productId)))

  // keep selected items in sync when cart changes
  useEffect(() => {
    setSelectedItems(new Set(cart.map((item) => item.productId)))
  }, [cart])

  // cache for remote product details (backend IDs)
  const [remoteProducts, setRemoteProducts] = useState<Record<string, any>>({})

  // fetch missing products from backend when logged in
  useEffect(() => {
    const missingIds = cart
      .map((c) => String(c.productId))
      .filter((id) => !mockProducts.some((p) => String(p.id) === id) && !remoteProducts[id])

    if (missingIds.length === 0) return
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
    if (!token) return

    missingIds.forEach(async (id) => {
      try {
        const res = await fetch(`https://market-api-5lg1.onrender.com/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) return
        const data = await res.json()
        const prod = Array.isArray(data) ? data[0] : data
        if (!prod) return
        // map backend product shape to frontend-friendly shape used in this page
        const mapped = {
          id: String(prod.id),
          vendorId: String(prod.vendor_name || prod.vendorId || ""),
          vendor_name: prod.vendor_username || prod.vendor_name || "",
          product_name: prod.product_name || prod.name || "",
          description: prod.description || "",
          price: Number(prod.price) || 0,
          category: prod.category || "",
          image_url: Array.isArray(prod.image_url) ? prod.image_url[0] || "/placeholder.svg" : prod.image_url || "/placeholder.svg",
          images: Array.isArray(prod.image_url) ? prod.image_url : prod.images || [],
          stock: prod.quantity ?? prod.stock ?? 0,
          sold: prod.sold ?? 0,
        }
        setRemoteProducts((prev) => ({ ...prev, [String(prod.id)]: mapped }))
      } catch (err) {
        console.error("Failed to fetch product", id, err)
      }
    })
  }, [cart, remoteProducts, user?.id])

  // avoid redirecting during render (causes React warning) — redirect in effect
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
    }
  }, [isLoading, user, router])

  if (isLoading) return null
  if (!user) return null

  if (user.role !== "buyer") {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">Only buyers can access the shopping cart.</p>
          <Link href="/">
            <Button>Go to Homepage</Button>
          </Link>
        </main>
      </div>
    )
  }

  // map cart entries to products; filter out items where the product cannot be found

  const cartItemsRaw = cart
    .map((item) => ({
      ...item,
      product:
        mockProducts.find((p) => String(p.id) === String(item.productId)) || remoteProducts[String(item.productId)] || null,
    }))
    .filter((item) => item.product !== null) as Array<{
    productId: string
    quantity: number
    product: NonNullable<typeof mockProducts[number]> | any
  }>

  // deduplicate by productId (merge quantities) to avoid duplicate keys in the list
  const cartItems = Object.values(
    cartItemsRaw.reduce((acc, item) => {
      const key = String(item.productId)
      if (!acc[key]) acc[key] = { ...item }
      else acc[key].quantity = (acc[key].quantity || 0) + (item.quantity || 0)
      return acc
    }, {} as Record<string, { productId: string; quantity: number; product: any }>)
  )

  const selectedCartItems = cartItems.filter((item) => selectedItems.has(item.productId))
  const total = selectedCartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  const toggleItemSelection = (productId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedItems(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(cartItems.map((item) => item.productId)))
    }
  }

  const handleCheckout = async () => {
    if (selectedItems.size === 0) {
      toast({
        title: "No items selected",
        description: "Please select at least one item to checkout.",
        variant: "destructive",
      })
      return
    }

    if (total > user.walletBalance) {
      toast({
        title: "Insufficient funds",
        description: "Please top up your wallet to complete this purchase.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))

    toast({
      title: "Order placed successfully!",
      description: `You've been charged $${total.toFixed(2)} from your wallet.`,
    })

    selectedItems.forEach((productId) => removeFromCart(productId))
    setSelectedItems(new Set())
    setIsProcessing(false)
    router.push("/home")
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-16">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-12 pb-12">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground mb-6">Start shopping to add items to your cart.</p>
              <Link href="/home">
                <Button>Browse Products</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <div className="flex items-center gap-2">
            <Checkbox
              id="select-all"
              checked={selectedItems.size === cartItems.length && cartItems.length > 0}
              onCheckedChange={toggleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All ({selectedItems.size}/{cartItems.length})
            </label>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.productId} className={!selectedItems.has(item.productId) ? "opacity-60" : ""}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-start pt-1">
                      <Checkbox
                        checked={selectedItems.has(item.productId)}
                        onCheckedChange={() => toggleItemSelection(item.productId)}
                      />
                    </div>
                    <img
                      src={item.product.image_url || "/placeholder.svg"}
                      alt={item.product.product_name}
                      className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-2 gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-lg truncate">{item.product.product_name}</h3>
                          <p className="text-sm text-muted-foreground">by {item.product.vendor_name}</p>
                        </div>
                        <p className="text-xl font-bold mt-1 sm:mt-0 sm:ml-4 flex-shrink-0">${item.product.price}</p>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 break-words">{item.product.description}</p>

                      <div className="flex flex-col sm:flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => {
                              const value = Number.parseInt(e.target.value)
                              if (value > 0 && value <= item.product.stock) {
                                updateQuantity(item.productId, value)
                              }
                            }}
                            className="w-16 text-center"
                            min="1"
                            max={item.product.stock}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-muted-foreground ml-2">{item.product.stock} available</span>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(item.productId)}
                          className="mt-2 sm:mt-0"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-20">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedItems.size > 0 ? (
                  <>
                    <div className="space-y-2">
                      {selectedCartItems.map((item) => (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            {item.product.product_name} x {item.quantity}
                          </span>
                          <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-4">No items selected</p>
                )}

                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Wallet Balance</span>
                    <span className="font-medium">${user.walletBalance.toFixed(2)}</span>
                  </div>
                  {total > user.walletBalance && selectedItems.size > 0 && (
                    <p className="text-xs text-destructive mt-2">Insufficient wallet balance</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button
                  className="w-full"
                  onClick={handleCheckout}
                  disabled={isProcessing || total > user.walletBalance || selectedItems.size === 0}
                >
                  {isProcessing ? "Processing..." : `Checkout (${selectedItems.size} items)`}
                </Button>
                <Link href="/home" className="w-full">
                  <Button variant="outline" className="w-full bg-transparent">
                    Continue Shopping
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
