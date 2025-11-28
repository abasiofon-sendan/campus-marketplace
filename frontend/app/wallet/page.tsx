"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Wallet, CreditCard, ArrowUpRight, ArrowDownLeft, TrendingUp } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const mockTransactions = [
  {
    id: "t1",
    type: "credit" as const,
    amount: 50,
    description: "Wallet top-up via Paystack",
    date: new Date("2024-02-20"),
  },
  {
    id: "t2",
    type: "debit" as const,
    amount: 45,
    description: "Purchase: Wireless Earbuds",
    date: new Date("2024-02-19"),
  },
  {
    id: "t3",
    type: "credit" as const,
    amount: 100,
    description: "Wallet top-up via Paystack",
    date: new Date("2024-02-18"),
  },
  {
    id: "t4",
    type: "debit" as const,
    amount: 18,
    description: "Purchase: Vintage T-Shirt",
    date: new Date("2024-02-17"),
  },
  {
    id: "t5",
    type: "credit" as const,
    amount: 25,
    description: "Sale: Tutoring Session",
    date: new Date("2024-02-16"),
  },
]

export default function WalletPage() {
  const { user, topUp, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [amount, setAmount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Only redirect to signin after auth initialization completes
    if (!isLoading && !user) {
      router.push("/signin")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container py-8">
          <p>Loading...</p>
        </main>
      </div>
    )
  }

  if (!user) return null

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const topUpAmount = Number.parseFloat(amount)

    if (Number.isNaN(topUpAmount) || topUpAmount < 5) {
      toast({
        title: "Invalid amount",
        description: "Minimum top-up amount is $5",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      const { success, checkoutUrl, reference, error, raw } = await topUp(topUpAmount)
      if (success && checkoutUrl) {
        // Redirect to Paystack checkout
        window.location.href = checkoutUrl
        return
      }

      if (success && !checkoutUrl) {
        // No checkout URL found in response — surface debug info
        console.warn("Top-up succeeded but no checkoutUrl returned:", raw)
        toast({
          title: "Top-up initialized",
          description: "Payment initialized but no checkout URL was returned. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Top-up failed",
          description: error || "An error occurred during top-up. Please try again.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error(err)
      toast({ title: "Top-up failed", description: "Network error", variant: "destructive" })
    } finally {
      setIsProcessing(false)
      setAmount("")
      setIsDialogOpen(false)
    }
  }

  const handleWithdraw = async () => {
    if (user.walletBalance < 10) {
      toast({
        title: "Insufficient balance",
        description: "Minimum withdrawal amount is $10",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    // Simulate withdrawal processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    toast({
      title: "Withdrawal initiated",
      description: "Your withdrawal request is being processed. Funds will arrive in 1-3 business days.",
    })

    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
          <p className="text-muted-foreground">Manage your funds and view transaction history</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Current Balance
              </CardTitle>
              <CardDescription>Available funds in your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold mb-6">${user.walletBalance.toFixed(2)}</div>
              <div className="flex gap-3">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1">
                      <ArrowDownLeft className="mr-2 h-4 w-4" />
                      Top Up
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleTopUp}>
                      <DialogHeader>
                        <DialogTitle>Top Up Wallet</DialogTitle>
                        <DialogDescription>Add funds to your wallet using Paystack</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="amount">Amount ($)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="5"
                            placeholder="Enter amount (min $5)"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => setAmount("10")}>
                            $10
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setAmount("25")}>
                            $25
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setAmount("50")}>
                            $50
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => setAmount("100")}>
                            $100
                          </Button>
                        </div>
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <p className="text-sm font-medium">Payment via Paystack</p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Secure payment processing through Paystack gateway
                          </p>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isProcessing}>
                          {isProcessing ? "Processing..." : "Proceed to Payment"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                {user.role === "vendor" && (
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={handleWithdraw}
                    disabled={isProcessing || user.walletBalance < 10}
                  >
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                    Withdraw
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-bold">$175.00</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Transactions</p>
                <p className="text-2xl font-bold">{mockTransactions.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Role</p>
                <Badge variant="secondary" className="capitalize">
                  {user.role}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>Your recent wallet activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        transaction.type === "credit"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "credit" ? (
                        <ArrowDownLeft className="h-5 w-5" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-semibold ${
                        transaction.type === "credit"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
