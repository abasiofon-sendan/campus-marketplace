"use client"

import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockVendors, mockProducts, mockCustomers, mockPurchases } from "@/lib/mock-data"
import { Trophy, Medal, Award, TrendingUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LeaderboardPage() {
  const vendorStats = mockVendors.map((vendor) => {
    const vendorProducts = mockProducts.filter((p) => p.vendorId === vendor.id)
    const totalSales = vendorProducts.reduce((sum, p) => sum + p.sold, 0)
    const totalRevenue = vendorProducts.reduce((sum, p) => sum + p.price * p.sold, 0)
    const totalProducts = vendorProducts.length

    return {
      ...vendor,
      totalSales,
      totalRevenue,
      totalProducts,
    }
  })

  const customerStats = mockCustomers.map((customer) => {
    const customerPurchases = mockPurchases.filter((p) => p.customerId === customer.id)
    const totalPurchases = customerPurchases.length
    const totalSpent = customerPurchases.reduce((sum, p) => sum + p.amount, 0)

    return {
      ...customer,
      totalPurchases,
      totalSpent,
    }
  })

  const sortedBySales = [...vendorStats].sort((a, b) => b.totalSales - a.totalSales)
  const sortedByRevenue = [...vendorStats].sort((a, b) => b.totalRevenue - a.totalRevenue)
  const sortedByProducts = [...vendorStats].sort((a, b) => b.totalProducts - a.totalProducts)

  const sortedByPurchases = [...customerStats].sort((a, b) => b.totalPurchases - a.totalPurchases)
  const sortedBySpent = [...customerStats].sort((a, b) => b.totalSpent - a.totalSpent)

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <div className="h-6 w-6 flex items-center justify-center font-bold">{rank + 1}</div>
    }
  }

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 0:
        return <Badge className="bg-yellow-500 text-white hover:bg-yellow-600">1st Place</Badge>
      case 1:
        return <Badge className="bg-gray-400 text-white hover:bg-gray-500">2nd Place</Badge>
      case 2:
        return <Badge className="bg-amber-600 text-white hover:bg-amber-700">3rd Place</Badge>
      default:
        return <Badge variant="outline">#{rank + 1}</Badge>
    }
  }

  const RankingCard = ({
    users,
    metricLabel,
    metricValue,
  }: {
    users: any[]
    metricLabel: string
    metricValue: (user: any) => string
  }) => (
    <div className="space-y-4">
      {users.map((user, index) => (
        <Card key={user.id} className={index < 3 ? "border-2" : ""}>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="shrink-0">{getRankIcon(index)}</div>
              <Avatar className="h-14 w-14">
                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                <AvatarFallback>
                  {user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">{user.name}</h3>
                  {getRankBadge(index)}
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{metricLabel}</p>
                <p className="text-2xl font-bold">{metricValue(user)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-3">UpStart Leaderboard</h1>
          <p className="text-lg text-muted-foreground">
            Celebrating our top-performing vendors and most active customers
          </p>
        </div>

        <Tabs defaultValue="vendors" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="vendors" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Top Vendors
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Top Customers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vendors">
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Vendor by Sales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sortedBySales[0].avatar || "/placeholder.svg"} alt={sortedBySales[0].name} />
                      <AvatarFallback>
                        {sortedBySales[0].name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{sortedBySales[0].name}</p>
                      <p className="text-sm text-muted-foreground">{sortedBySales[0].totalSales} sales</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Revenue Generator</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={sortedByRevenue[0].avatar || "/placeholder.svg"}
                        alt={sortedByRevenue[0].name}
                      />
                      <AvatarFallback>
                        {sortedByRevenue[0].name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{sortedByRevenue[0].name}</p>
                      <p className="text-sm text-muted-foreground">${sortedByRevenue[0].totalRevenue.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Products Listed</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={sortedByProducts[0].avatar || "/placeholder.svg"}
                        alt={sortedByProducts[0].name}
                      />
                      <AvatarFallback>
                        {sortedByProducts[0].name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{sortedByProducts[0].name}</p>
                      <p className="text-sm text-muted-foreground">{sortedByProducts[0].totalProducts} products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="sales" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="sales">By Sales Volume</TabsTrigger>
                <TabsTrigger value="revenue">By Revenue</TabsTrigger>
                <TabsTrigger value="products">By Products</TabsTrigger>
              </TabsList>

              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Volume Rankings</CardTitle>
                    <CardDescription>Vendors ranked by total number of items sold</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RankingCard
                      users={sortedBySales}
                      metricLabel="Total Sales"
                      metricValue={(v) => v.totalSales.toString()}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Rankings</CardTitle>
                    <CardDescription>Vendors ranked by total revenue generated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RankingCard
                      users={sortedByRevenue}
                      metricLabel="Total Revenue"
                      metricValue={(v) => `$${v.totalRevenue.toFixed(2)}`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products">
                <Card>
                  <CardHeader>
                    <CardTitle>Product Catalog Rankings</CardTitle>
                    <CardDescription>Vendors ranked by number of products listed</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RankingCard
                      users={sortedByProducts}
                      metricLabel="Products Listed"
                      metricValue={(v) => v.totalProducts.toString()}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="customers">
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Most Active Buyer</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={sortedByPurchases[0].avatar || "/placeholder.svg"}
                        alt={sortedByPurchases[0].name}
                      />
                      <AvatarFallback>
                        {sortedByPurchases[0].name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{sortedByPurchases[0].name}</p>
                      <p className="text-sm text-muted-foreground">{sortedByPurchases[0].totalPurchases} purchases</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={sortedBySpent[0].avatar || "/placeholder.svg"} alt={sortedBySpent[0].name} />
                      <AvatarFallback>
                        {sortedBySpent[0].name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{sortedBySpent[0].name}</p>
                      <p className="text-sm text-muted-foreground">${sortedBySpent[0].totalSpent.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="purchases" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="purchases">By Purchase Count</TabsTrigger>
                <TabsTrigger value="spent">By Total Spent</TabsTrigger>
              </TabsList>

              <TabsContent value="purchases">
                <Card>
                  <CardHeader>
                    <CardTitle>Purchase Count Rankings</CardTitle>
                    <CardDescription>Customers ranked by total number of purchases</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RankingCard
                      users={sortedByPurchases}
                      metricLabel="Total Purchases"
                      metricValue={(c) => c.totalPurchases.toString()}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="spent">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending Rankings</CardTitle>
                    <CardDescription>Customers ranked by total amount spent</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RankingCard
                      users={sortedBySpent}
                      metricLabel="Total Spent"
                      metricValue={(c) => `$${c.totalSpent.toFixed(2)}`}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
