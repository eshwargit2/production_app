"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import type { UserResponse } from "@/types"

export default function AdminTestPage() {
  const { data: me } = useSWR<UserResponse>("/api/auth/me", fetcher)
  const { data: usersData, mutate: mutateUsers } = useSWR<{users: any[]}>("/api/admin/users", fetcher)
  const [testResults, setTestResults] = useState<string[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testAdminPermissions = async () => {
    setIsRunning(true)
    setTestResults([])
    addResult("🧪 Starting admin permission tests...")

    try {
      // Test 1: Check current user
      addResult(`Current user: ${me?.user?.email} (Admin: ${me?.user?.isAdmin})`)

      // Test 2: Test users API
      const usersResponse = await fetch("/api/admin/users", {
        credentials: "include"
      })
      addResult(`Users API status: ${usersResponse.status}`)
      
      if (usersResponse.ok) {
        const usersResult = await usersResponse.json()
        addResult(`Found ${usersResult.users?.length || 0} users`)
      } else {
        const error = await usersResponse.json()
        addResult(`❌ Users API error: ${error.error}`)
      }

      // Test 3: Initialize users
      addResult("🔧 Initializing users with permission field...")
      const initResponse = await fetch("/api/admin/init-users", {
        method: "POST",
        credentials: "include"
      })
      
      if (initResponse.ok) {
        const initResult = await initResponse.json()
        addResult(`✅ Init result: ${initResult.message}`)
        addResult(`Updated ${initResult.updatedCount} users`)
      } else {
        const error = await initResponse.json()
        addResult(`❌ Init error: ${error.error}`)
      }

      // Test 4: Refresh users data
      addResult("🔄 Refreshing users data...")
      await mutateUsers()
      addResult("✅ Users data refreshed")

    } catch (error) {
      addResult(`❌ Test error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  const testProfile = async () => {
    setIsRunning(true)
    setTestResults([])
    addResult("🧪 Starting profile tests...")

    try {
      // Test 1: Current user info
      addResult(`Current user: ${me?.user?.email}`)

      // Test 2: Test profile update
      const testName = `Test User ${Date.now()}`
      addResult(`🔧 Testing profile update with name: "${testName}"`)
      
      const profileResponse = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: testName }),
        credentials: "include"
      })

      if (profileResponse.ok) {
        const result = await profileResponse.json()
        addResult(`✅ Profile updated: ${result.user.name}`)
      } else {
        const error = await profileResponse.json()
        addResult(`❌ Profile update error: ${error.error}`)
      }

      // Test 3: Test statistics
      addResult("🔧 Testing statistics API...")
      const statsResponse = await fetch("/api/auth/statistics", {
        credentials: "include"
      })

      if (statsResponse.ok) {
        const stats = await statsResponse.json()
        addResult(`✅ Statistics loaded: ${stats.totalAttempts} attempts`)
      } else {
        const error = await statsResponse.json()
        addResult(`❌ Statistics error: ${error.error}`)
      }

    } catch (error) {
      addResult(`❌ Test error: ${error}`)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen gradient-bg p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="glass-effect border-2 border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-2xl">🔧 Admin Test Dashboard</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button 
                onClick={testAdminPermissions}
                disabled={isRunning}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                {isRunning ? "🔄 Running..." : "🔑 Test Admin Permissions"}
              </Button>
              <Button 
                onClick={testProfile}
                disabled={isRunning}
                className="bg-gradient-to-r from-green-500 to-blue-500"
              >
                {isRunning ? "🔄 Running..." : "👤 Test Profile Features"}
              </Button>
            </div>

            {testResults.length > 0 && (
              <div className="bg-black/20 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="text-white font-semibold mb-2">Test Results:</h3>
                {testResults.map((result, index) => (
                  <div key={index} className="text-green-400 text-sm font-mono mb-1">
                    {result}
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Current Status:</h3>
              <div className="text-white/80 space-y-1">
                <p>User: {me?.user?.email || "Not loaded"}</p>
                <p>Admin: {me?.user?.isAdmin ? "✅ Yes" : "❌ No"}</p>
                <p>Users Found: {usersData?.users?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}