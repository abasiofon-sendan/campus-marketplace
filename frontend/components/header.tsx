"use client"

import Link from "next/link"
import { ShoppingCart, User, Wallet, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const router = useRouter()

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Campus Market</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/home" className="text-sm font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link href="/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
            Leaderboard
          </Link>
          {user?.role === "vendor" && (
            <>
              <Link href="/vendor/products" className="text-sm font-medium hover:text-primary transition-colors">
                My Products
              </Link>
              <Link href="/vendor/analytics" className="text-sm font-medium hover:text-primary transition-colors">
                Analytics
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-3">
            {user?.role === "buyer" && (
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItemsCount}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          <Link href="/wallet">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <Wallet className="h-4 w-4" />
              <span className="hidden sm:inline">${user?.walletBalance.toFixed(2)}</span>
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/wallet">Wallet</Link>
              </DropdownMenuItem>
              {user?.role === "vendor" && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/vendor/products">My Products</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/vendor/analytics">Analytics</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
