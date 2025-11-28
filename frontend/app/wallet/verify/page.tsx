"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function WalletVerifyPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { verifyTopup } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("ref")
    if (!reference) {
      toast({ title: "Missing reference", description: "No payment reference found in the URL.", variant: "destructive" })
      router.replace('/wallet')
      return
    }

    const runVerify = async () => {
      setLoading(true)
      const res = await verifyTopup(reference)
      if (res.success) {
        toast({ title: "Top-up verified", description: "Your wallet has been updated.", variant: "default" })
      } else {
        toast({ title: "Verification failed", description: res.error || "Could not verify payment.", variant: "destructive" })
      }

      setLoading(false)
      // Give user a moment to read toast, then go back to wallet page
      setTimeout(() => router.replace('/wallet'), 1500)
    }

    runVerify()
  }, [searchParams, verifyTopup, router, toast])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="text-center py-20">
          {loading ? (
            <p className="text-lg">Verifying payment, please wait...</p>
          ) : (
            <p className="text-lg">Redirecting to wallet...</p>
          )}
        </div>
      </main>
    </div>
  )
}
