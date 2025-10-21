"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"

export function SignupForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, isAdmin }),
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Signup failed")
      }
      
      // Successfully signed up
      console.log("Signup successful:", data)
      
      // Check if user is admin and redirect accordingly
      if (data.user && data.user.isAdmin) {
        window.location.href = "/admin"
      } else {
        window.location.href = "/dashboard"
      }
    } catch (err: any) {
      console.error("Signup error:", err)
      setError(err.message || "Signup failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 max-w-sm mx-auto w-full">
      <div className="grid gap-3">
        <label className="text-sm font-bold text-bold-white mobile-text">Name</label>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          className="glass-effect-enhanced text-bold-white placeholder:text-white/50 border-white/30 focus:border-white/60 font-semibold mobile-button"
          placeholder="Enter your full name"
        />
      </div>
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
          placeholder="Create a strong password"
        />
      </div>
      <div className="flex items-center gap-3 p-3 glass-effect-enhanced rounded-lg">
        <Checkbox 
          checked={isAdmin} 
          onCheckedChange={(v) => setIsAdmin(Boolean(v))} 
          id="adm" 
          className="border-white/50 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
        />
        <label htmlFor="adm" className="text-sm font-bold text-bold-white mobile-text">
          🔧 Admin Account
        </label>
      </div>
      {error && <p className="text-red-400 mobile-text font-semibold bg-red-500/10 p-3 rounded-lg border border-red-400/30">{error}</p>}
      <Button 
        type="submit" 
        disabled={loading} 
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white font-extrabold mobile-button transform hover:scale-105 transition-all duration-300 w-full"
      >
        {loading ? "Creating..." : "🚀 Create Account"}
      </Button>
    </form>
  )
}
