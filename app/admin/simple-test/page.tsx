"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function SimpleAdminTest() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, `${timestamp}: ${message}`])
    console.log(message)
  }

  const loadUsers = async () => {
    setLoading(true)
    addLog("🔄 Loading users...")
    
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include"
      })
      
      addLog(`📥 Response status: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Loaded ${data.users?.length || 0} users`)
        setUsers(data.users || [])
      } else {
        const error = await response.json()
        addLog(`❌ Error: ${error.error}`)
      }
    } catch (error) {
      addLog(`❌ Network error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleUserPermission = async (userId: string, currentPermission: boolean, userEmail: string) => {
    const newPermission = !currentPermission
    addLog(`🔧 Toggling ${userEmail}: ${currentPermission} → ${newPermission}`)
    
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          canTakeQuizzes: newPermission
        }),
        credentials: "include"
      })
      
      addLog(`📥 Update response: ${response.status}`)
      
      if (response.ok) {
        const data = await response.json()
        addLog(`✅ Updated successfully: ${data.user.email} = ${data.user.canTakeQuizzes}`)
        // Reload users to see the change
        await loadUsers()
      } else {
        const error = await response.json()
        addLog(`❌ Update failed: ${error.error}`)
      }
    } catch (error) {
      addLog(`❌ Update network error: ${error}`)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-white text-3xl font-bold mb-6">Simple Admin Permission Test</h1>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={loadUsers} disabled={loading}>
            {loading ? "Loading..." : "🔄 Reload Users"}
          </Button>
          <Button onClick={() => setLogs([])}>
            🗑️ Clear Logs
          </Button>
          <Button onClick={async () => {
            addLog("🔑 Testing admin authentication...")
            try {
              const response = await fetch("/api/admin/auth-test", { credentials: "include" })
              const data = await response.json()
              addLog(`Auth test result: ${data.success ? "SUCCESS" : "FAILED"}`)
              if (data.success) {
                addLog(`Admin: ${data.admin.email} (${data.admin.isAdmin})`)
              } else {
                addLog(`Error: ${data.error}`)
              }
            } catch (error) {
              addLog(`Auth test error: ${error}`)
            }
          }}>
            🔑 Test Auth
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users List */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Users ({users.length})</h2>
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user._id} className="bg-gray-700 rounded p-4">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-300 text-sm">{user.email}</div>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-sm ${user.canTakeQuizzes ? 'text-green-400' : 'text-red-400'}`}>
                      {user.canTakeQuizzes ? '✅ Can take quizzes' : '❌ Cannot take quizzes'}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => toggleUserPermission(user._id, user.canTakeQuizzes, user.email)}
                      className={user.canTakeQuizzes ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
                    >
                      {user.canTakeQuizzes ? '🚫 Revoke' : '✅ Grant'}
                    </Button>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-gray-400 text-center py-8">
                  No users found
                </div>
              )}
            </div>
          </div>

          {/* Logs */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-white text-xl font-semibold mb-4">Logs</h2>
            <div className="bg-black rounded p-4 h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="text-green-400 text-sm font-mono mb-1">
                  {log}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500 text-sm">No logs yet...</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}