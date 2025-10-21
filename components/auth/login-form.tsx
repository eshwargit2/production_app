"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useSWR("/api/auth/me", fetcher, { shouldRetryOnError: false })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }
      
      // Successfully logged in
      console.log("Login successful:", data)
      
      // Check if user is admin and redirect accordingly
      if (data.user && data.user.isAdmin) {
        window.location.href = "/admin"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-sm mx-auto w-full">
      <div className="grid gap-3">
        <label className="text-sm font-bold text-bold-white mobile-text">Email</label>
        <Input 
          type="email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          className="glass-effect-enhanced text-bold-white placeholder:text-white/50 border-white/30 focus:border-white/60 font-semibold mobile-button"
          placeholder="Enter your email"
        />
      </div>
      <div className="grid gap-3">
        <label className="text-sm font-bold text-bold-white mobile-text">Password</label>
        <Input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          className="glass-effect-enhanced text-bold-white placeholder:text-white/50 border-white/30 focus:border-white/60 font-semibold mobile-button"
          placeholder="Enter your password"
        />
      </div>
      {error && <p className="text-red-400 mobile-text font-semibold bg-red-500/10 p-3 rounded-lg border border-red-400/30">{error}</p>}
      <Button 
        type="submit" 
        disabled={loading} 
        className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-bold-white font-extrabold mobile-button transform hover:scale-105 transition-all duration-300 w-full"
      >
        {loading ? "Signing in..." : "🔑 Sign In"}
      </Button>
    </form>
  )
}
