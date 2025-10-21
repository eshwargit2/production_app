"use client"

import { useState, useEffect } from "react"
import useSWR, { mutate } from "swr"
import Link from "next/link"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ProfileAvatar } from "@/components/ui/profile-avatar"
import type { UserResponse } from "@/types"

export default function ProfilePage() {
  const { data: me } = useSWR<UserResponse>("/api/auth/me", fetcher)
  const { data: stats } = useSWR("/api/auth/statistics", fetcher)
  const [selectedAvatar, setSelectedAvatar] = useState<number>(1)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState("")
  
  // Profile editing state
  const [editedName, setEditedName] = useState("")
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState("")

  // Set initial values when user data loads
  useEffect(() => {
    if (me?.user?.avatarId) {
      setSelectedAvatar(me.user.avatarId)
    }
    if (me?.user?.name) {
      setEditedName(me.user.name)
    }
  }, [me?.user?.avatarId, me?.user?.name])

  const handleAvatarUpdate = async () => {
    if (!selectedAvatar) return
    
    setIsUpdating(true)
    setMessage("")
    
    try {
      const response = await fetch("/api/auth/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ avatarId: selectedAvatar }),
        credentials: "include"
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("✅ Avatar updated successfully!")
        // Refresh user data with force refresh
        try {
          await mutate("/api/auth/me", undefined, { revalidate: true })
          console.log("Avatar update: User data refreshed successfully")
        } catch (mutateError) {
          console.error("Avatar update: Error refreshing user data:", mutateError)
        }
      } else {
        const errorMsg = data.error || "Unknown error"
        console.error("Avatar update failed:", errorMsg)
        setMessage(`❌ Failed to update avatar: ${errorMsg}`)
      }
    } catch (error) {
      console.error("Avatar update error:", error)
      setMessage("❌ Network error - please check your connection")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleProfileUpdate = async () => {
    console.log("=== Profile Update Started ===")
    console.log("Current state:", {
      editedName: editedName,
      originalName: me?.user?.name
    })

    if (!editedName.trim()) {
      setProfileMessage("❌ Name cannot be empty")
      return
    }

    setIsUpdatingProfile(true)
    setProfileMessage("")
    
    try {
      console.log("Sending profile update:", { 
        name: editedName.trim()
      })

      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: editedName.trim()
        }),
        credentials: "include"
      })

      const data = await response.json()
      console.log("Profile update response:", { status: response.status, data })

      if (response.ok) {
        console.log("✅ Profile update successful!")
        setProfileMessage("✅ Profile updated successfully!")
        // Refresh user data with force refresh
        try {
          await mutate("/api/auth/me", undefined, { revalidate: true })
          console.log("User data refreshed successfully")
        } catch (mutateError) {
          console.error("Error refreshing user data:", mutateError)
        }
        console.log("=== Profile Update Completed Successfully ===")
      } else {
        const errorMsg = data.error || "Unknown error"
        console.error("Profile update failed:", { status: response.status, error: errorMsg })
        setProfileMessage(`❌ Failed to update profile: ${errorMsg}`)
      }
    } catch (error) {
      console.error("Profile update error:", error)
      if (error instanceof Error) {
        setProfileMessage(`❌ Error: ${error.message}`)
      } else {
        setProfileMessage("❌ Network error - please check your connection")
      }
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  if (!me?.user) {
    return (
      <div className="min-h-screen gradient-bg">
        <main className="max-w-3xl mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">🔒 Access Denied</h1>
            <p className="text-white/70 mb-6">Please log in to access your profile settings.</p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                🔑 Login
              </Button>
            </Link>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Header with navigation */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-float">
              ⚙️ Profile Settings
            </h1>
            <p className="text-white/70 mt-2">Customize your profile and avatar</p>
          </div>
          <div className="flex gap-3">
            <Link href="/dashboard">
              <Button className="glass-effect text-white border-white/30 hover:bg-white/20">
                🏠 Dashboard
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0">
                🏆 Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Profile Info */}
          <Card className="glass-effect border-2 border-white/20 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                👤 Edit Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="text-white/80 text-sm font-medium">Name</label>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Enter your name"
                  className="mt-1 glass-effect border-white/20 text-white placeholder:text-white/50 focus:border-white/40"
                  maxLength={100}
                />
              </div>
              
              {/* Email (Read-only) */}
              <div>
                <label className="text-white/80 text-sm font-medium">Email</label>
                <div className="glass-effect rounded-lg p-3 border border-white/20 mt-1">
                  <p className="text-white">{me.user.email}</p>
                </div>
              </div>
              
              {/* Role (Read-only) */}
              <div>
                <label className="text-white/80 text-sm font-medium">Role</label>
                <div className="glass-effect rounded-lg p-3 border border-white/20 mt-1">
                  <p className="text-white flex items-center gap-2">
                    {me.user.isAdmin ? (
                      <>⚡ Administrator</>
                    ) : (
                      <>🎯 Quiz Player</>
                    )}
                  </p>
                </div>
              </div>

              {/* Save Profile Button */}
              {profileMessage && (
                <div className={`glass-effect rounded-lg p-3 border ${
                  profileMessage.includes("✅") ? "border-green-400/30 bg-green-500/10" : "border-red-400/30 bg-red-500/10"
                }`}>
                  <p className="text-white text-center text-sm">{profileMessage}</p>
                </div>
              )}
              
              <Button
                onClick={handleProfileUpdate}
                disabled={isUpdatingProfile}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isUpdatingProfile ? (
                  <>🔄 Saving...</>
                ) : (
                  <>💾 Save Profile Changes</>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Avatar Selection */}
          <Card className="glass-effect border-2 border-white/20 animate-slide-in-right">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                🎨 Choose Your Avatar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ProfileAvatar 
                  selectedAvatar={selectedAvatar}
                  onSelect={setSelectedAvatar}
                  size="xl"
                  animated={true}
                  showSelector={true}
                />
                
                {message && (
                  <div className={`glass-effect rounded-lg p-3 border ${
                    message.includes("✅") ? "border-green-400/30 bg-green-500/10" : "border-red-400/30 bg-red-500/10"
                  }`}>
                    <p className="text-white text-center">{message}</p>
                  </div>
                )}
                
                <Button
                  onClick={handleAvatarUpdate}
                  disabled={isUpdating || selectedAvatar === me.user.avatarId}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white border-0 transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isUpdating ? (
                    <>🔄 Updating...</>
                  ) : selectedAvatar === me.user.avatarId ? (
                    <>✅ Current Avatar</>
                  ) : (
                    <>💾 Save Avatar</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Statistics */}
        <Card className="glass-effect border-2 border-white/20 animate-fade-in-up mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              📊 Your Quiz Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!me?.user?.canTakeQuizzes ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔒</div>
                <h3 className="text-white font-semibold text-xl mb-2">Quiz Access Restricted</h3>
                <p className="text-white/70 mb-4">You need admin permission to take quizzes.</p>
                <p className="text-white/50 text-sm">Contact your administrator to request access.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                <div className="glass-effect rounded-lg p-4 border border-white/20">
                  <div className="text-3xl mb-2">📝</div>
                  <h3 className="text-white font-semibold">Completed</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-500 bg-clip-text text-transparent">
                    {stats?.statistics?.completedQuizzes || 0}
                  </p>
                </div>
                
                <div className="glass-effect rounded-lg p-4 border border-white/20">
                  <div className="text-3xl mb-2">⭐</div>
                  <h3 className="text-white font-semibold">Average Score</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                    {stats?.statistics?.averageScore || 0}%
                  </p>
                </div>
                
                <div className="glass-effect rounded-lg p-4 border border-white/20">
                  <div className="text-3xl mb-2">�</div>
                  <h3 className="text-white font-semibold">Rank</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    {stats?.statistics?.rank ? `#${stats.statistics.rank}` : "#N/A"}
                  </p>
                  {stats?.statistics?.totalUsers && (
                    <p className="text-white/50 text-xs">of {stats.statistics.totalUsers} users</p>
                  )}
                </div>
                
                <div className="glass-effect rounded-lg p-4 border border-white/20">
                  <div className="text-3xl mb-2">⏱️</div>
                  <h3 className="text-white font-semibold">Time Spent</h3>
                  <p className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                    {stats?.statistics?.timeSpentMinutes || 0}m
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
