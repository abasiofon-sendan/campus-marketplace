"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  signup: (name: string, email: string, password: string, role: "buyer" | "vendor") => Promise<{ success: boolean; status?: number }>
  login: (email: string, password: string) => Promise<{ success: boolean; user: User | null }>
  logout: () => void
  isLoading: boolean
  topUp: (amount: number) => Promise<{ success: boolean; checkoutUrl?: string | null; reference?: string | null; error?: string | null; raw?: any }>
  verifyTopup: (reference: string) => Promise<{ success: boolean; data?: any; error?: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DUMMY_USERS: User[] = []

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    const storedUsers = localStorage.getItem("dummy_users")

    if (storedUsers) {
      DUMMY_USERS.push(...JSON.parse(storedUsers))
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signup = async (username: string, email: string, password: string, role: "buyer" | "vendor") => {
    try{
      const response = await fetch('https://market-api-5lg1.onrender.com/auth/users/',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        })
      })

      if(response.ok){
        return { success: true}
      }else{
        return { success: false, status: response.status }
      }
    } catch (error) {
      console.error('Error during signup:', error);
      return { success: false, status: 500 }
    }
    // // Simulate API delay
    // await new Promise((resolve) => setTimeout(resolve, 500))

    // // Check if user already exists
    // const existingUser = DUMMY_USERS.find((u) => u.email === email)
    // if (existingUser) {
    //   return { success: false }
    // }

    // // Create new user
    // const newUser: User = {
    //   id: `user_${Date.now()}`,
    //   name,
    //   email,
    //   role,
    //   walletBalance: 0,
    // }

    // DUMMY_USERS.push(newUser)
    // localStorage.setItem("dummy_users", JSON.stringify(DUMMY_USERS))

    // return { success: true }
  }

  const login = async (email: string, password: string) => {
    try{
      const response = await fetch('https://market-api-5lg1.onrender.com/auth/jwt/create/',{
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        })
      })

      if(response.ok){

        const data = await response.json();
        const apiUser = data.user ?? data

        const userObj: User = {
          id: apiUser.id ?? apiUser.user_id,
          name: apiUser.username,
          email: apiUser.email,
          role: apiUser.role,
          walletBalance: apiUser.wallet_balance || 0,
          createdAt: apiUser.createdAt ? new Date(apiUser.createdAt) : new Date(),
        }
        
        // const data = await response.json();
        

        // const user: User = {
        //   id: data.user.id,
        //   name: data.user.username,
        //   email: data.user.email,
        //   role: data.user.role,
        //   walletBalance: data.user.wallet_balance || 0,
        // }
        
        setUser(userObj)
        localStorage.setItem("user", JSON.stringify(userObj))
        const tokenValue = data.token ?? data.access ?? data.access_token ?? ""
        if (tokenValue) localStorage.setItem("token", tokenValue)

        return { success: true, user: userObj }
    }else{
        return { success: false, user: null }
    }
  } catch (error) {
      console.error('Error during login:', error);
      return { success: false, user: null }
    }
  }
  //   // Simulate API delay
  //   await new Promise((resolve) => setTimeout(resolve, 500))

  //   const storedUsers = localStorage.getItem("dummy_users")
  //   const users = storedUsers ? JSON.parse(storedUsers) : []

  //   const foundUser = users.find((u: User) => u.email === email)

  //   if (foundUser) {
  //     setUser(foundUser)
  //     localStorage.setItem("user", JSON.stringify(foundUser))
  //     return { success: true, user: foundUser }
  //   }

  //   return { success: false, user: null }
  // }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  const topUp = async (amount: number) => {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : ''
      const res = await fetch('https://market-api-5lg1.onrender.com/wallet/topup', {
        method: 'POST',
        headers: token
          ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
          : { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: (data && (data.detail || data.error || JSON.stringify(data))) || 'Topup request failed' }
      }

      // Backend wraps the Paystack initialize response under a `details` key.
      // Normalize and try several common nesting patterns to find the authorization URL and reference.
      const payload = data.details ?? data
      const nested = (payload && (payload.data ?? payload)) || payload

      let checkoutUrl =
        nested?.authorization_url ||
        nested?.authorization?.authorization_url ||
        payload?.authorization_url ||
        data.checkout_url ||
        data.authorization_url ||
        nested?.url ||
        null

      // Paystack sometimes returns an `access_code` — the checkout URL can be
      // constructed as `https://checkout.paystack.com/{access_code}` when the
      // `authorization_url` is not present.
      const accessCode = nested?.access_code || payload?.access_code || data.access_code || (nested?.authorization && nested.authorization.access_code)
      if (!checkoutUrl && accessCode) {
        checkoutUrl = `https://checkout.paystack.com/${accessCode}`
      }

      const reference =
        nested?.reference || nested?.ref || nested?.access_code || payload?.reference || data.reference || (nested?.authorization && nested.authorization.reference) || null

      return { success: true, checkoutUrl, reference, raw: data }
    } catch (err) {
      console.error('Topup error', err)
      return { success: false, error: (err as Error)?.message ?? 'Network error' }
    }
  }

  const verifyTopup = async (reference: string) => {
    try {
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || '') : ''
      const url = `https://market-api-5lg1.onrender.com/wallet/verify-topup/${encodeURIComponent(reference)}`
      const res = await fetch(url, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        return { success: false, error: (data && (data.detail || data.error || JSON.stringify(data))) || 'Verification failed' }
      }

      // If server returned an updated wallet balance, persist it to the user object
      const newBalance = data.wallet_balance ?? data.balance ?? data.new_balance ?? (data.data && data.data.wallet_balance)
      if (newBalance !== undefined && user) {
        const updatedUser = { ...user, walletBalance: newBalance }
        setUser(updatedUser)
        try { localStorage.setItem('user', JSON.stringify(updatedUser)) } catch {}
      }

      return { success: true, data }
    } catch (err) {
      console.error('Verify topup error', err)
      return { success: false, error: (err as Error)?.message ?? 'Network error' }
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, signup, login, logout, isLoading, topUp, verifyTopup }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function isStrongPassword(password: string): boolean {
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return hasUpper && hasLower && hasNumber;
}