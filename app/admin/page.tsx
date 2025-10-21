"use client"

import { useState } from "react"
import useSWR, { mutate } from "swr"
import Link from "next/link"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ProfileAvatar } from "@/components/ui/profile-avatar"
import type { UserResponse, QuizzesResponse, Quiz } from "@/types"

export default function AdminDashboard() {
  const { data: me } = useSWR<UserResponse>("/api/auth/me", fetcher)
  const { data: quizzesData } = useSWR<QuizzesResponse>("/api/quizzes", fetcher)
  const { data: usersData } = useSWR<{users: any[]}>("/api/admin/users", fetcher)
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null)
  
  // Extract quizzes and users array from the responses
  const quizzes: Quiz[] = quizzesData?.quizzes || []
  const users = usersData?.users || []

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { 
        method: "POST", 
        credentials: "include" 
      })
      window.location.href = "/"
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`
    )
    
    if (!confirmed) return

    setDeletingQuizId(quizId)
    
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (response.ok) {
        // Refresh the quizzes list
        mutate("/api/quizzes")
        alert(`✅ Quiz "${quizTitle}" deleted successfully!`)
      } else {
        const errorData = await response.json()
        alert(`❌ Failed to delete quiz: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error("Delete quiz error:", error)
      alert("❌ Network error - please check your connection")
    } finally {
      setDeletingQuizId(null)
    }
  }

  if (!me?.user?.isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 border-2 border-white/20 animate-fade-in-up text-center">
          <h2 className="text-2xl font-bold text-white mb-4">🔒 Access Denied</h2>
          <p className="text-white/80">You don't have permission to access this page.</p>
          <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500" onClick={() => window.history.back()}>
            🔙 Go Back
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-6xl mx-auto mobile-container py-10">
        {/* Header */}
        <div className="mobile-nav mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <ProfileAvatar 
              selectedAvatar={me.user.avatarId || 1} 
              size="lg" 
              animated={true}
            />
            <div>
              <h1 className="mobile-header text-bold-gradient animate-float">
                ⚡ Admin Dashboard ⚡
              </h1>
              <p className="text-description mt-1 mobile-text">Welcome, {me.user.name || me.user.email}</p>
            </div>
          </div>
          <div className="mobile-nav-buttons">
            <Link href="/">
              <Button className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                🏠 Home
              </Button>
            </Link>
            <Link href="/profile">
              <Button className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                ⚙️ Profile
              </Button>
            </Link>
            <Link href="/admin/import">
              <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-bold-white border-0 mobile-button w-full sm:w-auto font-bold">
                📥 Import Questions
              </Button>
            </Link>
            <Link href="/admin/live">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white border-0 mobile-button w-full sm:w-auto font-bold">
                🎮 Live Quiz
              </Button>
            </Link>
            <Button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-bold-white border-0 transform hover:scale-105 transition-all duration-300 mobile-button w-full sm:w-auto font-bold"
            >
              🚪 Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mobile-grid mb-8">
          <Card className="glass-effect-enhanced animate-slide-in-left mobile-card">
            <CardHeader>
              <CardTitle className="text-bold-white flex items-center gap-2 mobile-text">
                📊 Total Quizzes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-bold-gradient">
                {quizzes?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect-enhanced animate-slide-in-left mobile-card" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="text-bold-white flex items-center gap-2 mobile-text">
                👥 Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-bold-gradient">
                {users?.length || 0}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect-enhanced animate-slide-in-left mobile-card" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="text-bold-white flex items-center gap-2 mobile-text">
                🎯 Quiz Attempts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-bold-gradient">
                N/A
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Management */}
        <Card className="glass-effect-enhanced animate-fade-in-up mobile-card">
          <CardHeader>
            <CardTitle className="text-bold-white mobile-subheader">🎮 Quiz Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mobile-spacing">
              {quizzes.map((quiz: Quiz, index: number) => (
                <div key={quiz._id} className="mobile-flex items-start justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex-1">
                    <h3 className="text-bold-white font-semibold mobile-text">{quiz.title}</h3>
                    <p className="text-description mobile-text">{quiz.description}</p>
                    <p className="text-description text-sm">⏱️ 30s per question • 📝 {quiz.questionIds?.length || 0} questions</p>
                  </div>
                  <div className="mobile-nav-buttons">
                    <Link href={`/quiz/${quiz._id}`}>
                      <Button size="sm" className="button-enhanced text-bold-white mobile-button">
                        👁️ Preview
                      </Button>
                    </Link>
                    <Button 
                      size="sm" 
                      onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                      disabled={deletingQuizId === quiz._id}
                      className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-bold-white border-0 disabled:opacity-50 disabled:cursor-not-allowed mobile-button font-bold"
                    >
                      {deletingQuizId === quiz._id ? "🔄 Deleting..." : "🗑️ Delete"}
                    </Button>
                  </div>
                </div>
              ))}
              {(!quizzes || quizzes.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-description mobile-text mb-4">📝 No quizzes created yet</p>
                  <Link href="/admin/import">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white border-0 mobile-button font-bold">
                      ➕ Create Your First Quiz
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Management */}
        <Card className="glass-effect-enhanced animate-fade-in-up mt-8 mobile-card">
          <CardHeader>
            <CardTitle className="text-bold-white mobile-subheader">👥 User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mobile-spacing">
              {users.map((user: any, index: number) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-300" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-bold-white font-semibold mobile-text">{user.name || "No Name"}</h3>
                      <p className="text-description mobile-text">{user.email}</p>
                    </div>
                  </div>
                </div>
              ))}
              {(!users || users.length === 0) && (
                <div className="text-center py-8">
                  <p className="text-description mobile-text mb-4">👥 No users found</p>
                  <p className="text-description mobile-text">Users will appear here once they sign up.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 mobile-grid">
          <Card className="glass-effect-enhanced animate-slide-in-left mobile-card">
            <CardHeader>
              <CardTitle className="text-bold-white mobile-text">🚀 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="mobile-spacing">
              <Link href="/admin/import">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-bold-white border-0 mobile-button font-bold">
                  📥 Import Questions from Excel
                </Button>
              </Link>
              <Link href="/leaderboard">
                <Button className="w-full button-enhanced text-bold-white mobile-button">
                  🏆 View Leaderboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-effect-enhanced animate-slide-in-right mobile-card">
            <CardHeader>
              <CardTitle className="text-bold-white mobile-text">📊 System Info</CardTitle>
            </CardHeader>
            <CardContent className="text-description mobile-spacing">
              <p className="mobile-text">🔧 Admin: {me?.user?.email}</p>
              <p className="mobile-text">🌐 Environment: Development</p>
              <p className="mobile-text">📅 Last Updated: {new Date().toLocaleDateString()}</p>
              <p className="mobile-text">⚡ Status: Online</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
