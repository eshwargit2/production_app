"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { ProfileAvatar } from "@/components/ui/profile-avatar"
import type { UserResponse, QuizzesResponse, LeaderboardResponse, Quiz } from "@/types"

export default function UserDashboard() {
  const { data: me } = useSWR<UserResponse>("/api/auth/me", fetcher)
  const { data: quizzesData } = useSWR<QuizzesResponse>("/api/quizzes", fetcher)
  const { data: leaderboard } = useSWR<LeaderboardResponse>("/api/leaderboard", fetcher)

  // Extract quizzes array from the response
  const quizzes: Quiz[] = quizzesData?.quizzes || []

  const userStats = {
    completedQuizzes: 0,
    averageScore: 0,
    rank: 0,
    totalTimeSpent: 0
  }

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

  if (!me?.user) {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <header className="flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in-up">
            <h1 className="heading-primary text-center animate-float text-bold-gradient">
              🎯 Welcome to Quiz App ✨
            </h1>
            <div className="flex items-center gap-2 animate-slide-in-right">
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white border-0 transform hover:scale-105 transition-all duration-300 font-bold">
                  ✨ Sign Up
                </Button>
              </Link>
              <Link href="/login">
                <Button className="button-enhanced text-bold-white transform hover:scale-105 transition-all duration-300">
                  🔑 Sign In
                </Button>
              </Link>
            </div>
          </header>

          <section className="grid gap-6 sm:grid-cols-2 animate-fade-in-up">
            {quizzes.map((q: Quiz, index: number) => (
              <div key={q._id} className={`card-hover quiz-card-enhanced animate-slide-in-left`} style={{animationDelay: `${index * 0.1}s`}}>
                <h3 className="text-enhanced mb-3 text-bold-gradient">{q.title}</h3>
                <p className="text-description mb-4 text-lg">{q.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full backdrop-blur font-semibold">
                    ⏱️ 30s per question
                  </span>
                  <Link href={`/quiz/${q._id}`}>
                    <Button className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-bold-white border-0 transform hover:scale-110 transition-all duration-300 shadow-lg font-bold">
                      🚀 Start Quiz
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
            {(!quizzes || quizzes.length === 0) && (
              <div className="col-span-full text-center py-12">
                <p className="text-description text-xl mb-4">🎭 No quizzes available!</p>
                <p className="text-white/40">Check back later for new quizzes.</p>
              </div>
            )}
          </section>

          <section className="text-center animate-fade-in-up">
            <div className="glass-effect rounded-xl p-8 border-2 border-white/20">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent mb-4">
                🚀 Ready to Test Your Knowledge?
              </h2>
              <p className="text-white/80 mb-6">Create an account to track your progress and compete on the leaderboard!</p>
              <div className="flex gap-3 justify-center">
                <Link href="/signup">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
                    ✨ Get Started
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button className="glass-effect text-white border-white/30 hover:bg-white/20 transform hover:scale-105 transition-all duration-300">
                    🏆 View Rankings
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-6xl mx-auto mobile-container py-10">
        {/* User Header */}
        <div className="mobile-nav mb-8 animate-fade-in-up">
          <div className="flex items-center gap-4">
            <ProfileAvatar 
              selectedAvatar={me.user.avatarId || 1} 
              size="lg" 
              animated={true}
            />
            <div>
              <h1 className="mobile-header text-bold-gradient animate-float">
                👋 Welcome back, {me.user.name || me.user.email}!
              </h1>
              <p className="text-description mt-2 mobile-text">Ready for your next challenge?</p>
            </div>
          </div>
          <div className="mobile-nav-buttons">
            <Link href="/profile">
              <Button className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                ⚙️ Profile
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                🏆 Leaderboard
              </Button>
            </Link>
            <Link href="/join-live">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white border-0 mobile-button w-full sm:w-auto font-bold">
                🎮 Join Live Quiz
              </Button>
            </Link>
            {me.user.isAdmin && (
              <Link href="/admin">
                <Button className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-bold-white border-0 font-bold mobile-button w-full sm:w-auto">
                  ⚡ Admin Panel
                </Button>
              </Link>
            )}
            <Button 
              onClick={handleLogout}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-bold-white border-0 transform hover:scale-105 transition-all duration-300 font-bold mobile-button w-full sm:w-auto"
            >
              🚪 Logout
            </Button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect border-2 border-white/20 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="text-white text-sm">🎯 Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                {userStats.completedQuizzes}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-2 border-white/20 animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <CardHeader>
              <CardTitle className="text-white text-sm">⭐ Average Score</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                {userStats.averageScore}%
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-2 border-white/20 animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <CardHeader>
              <CardTitle className="text-white text-sm">🏆 Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                #{userStats.rank || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card className="glass-effect border-2 border-white/20 animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            <CardHeader>
              <CardTitle className="text-white text-sm">⏱️ Time Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {userStats.totalTimeSpent}min
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Quizzes */}
        <Card className="glass-effect border-2 border-white/20 animate-fade-in-up mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">🎮 Available Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              {quizzes.map((quiz: Quiz, index: number) => (
                <div key={quiz._id} className="card-hover glass-effect rounded-lg p-4 border border-white/10 animate-slide-in-left" style={{animationDelay: `${index * 0.1}s`}}>
                  <h3 className="text-white font-semibold text-lg mb-2">{quiz.title}</h3>
                  <p className="text-white/70 mb-3">{quiz.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full">
                      ⏱️ 30s per question • 📝 {quiz.questionIds?.length || 0} questions
                    </span>
                    <Link href={`/quiz/${quiz._id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white border-0 transform hover:scale-110 transition-all duration-300">
                        ▶️ Start
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {(!quizzes || quizzes.length === 0) && (
                <div className="col-span-full text-center py-8">
                  <p className="text-white/60 text-xl mb-4">🎭 No quizzes available</p>
                  <p className="text-white/40">Check back later for new challenges!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity & Leaderboard Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="glass-effect border-2 border-white/20 animate-slide-in-left">
            <CardHeader>
              <CardTitle className="text-white">📈 Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-white/60">No recent activity</p>
                <p className="text-white/40 text-sm">Take a quiz to see your activity here!</p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect border-2 border-white/20 animate-slide-in-right">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                🏆 Top Performers
                <Link href="/leaderboard">
                  <Button size="sm" className="glass-effect text-white border-white/30 hover:bg-white/20">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leaderboard?.rows?.slice(0, 3).map((row: any, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : 'bg-orange-500'
                    }`}>
                      {i + 1}
                    </span>
                    <ProfileAvatar 
                      selectedAvatar={row.avatarId || 1} 
                      size="sm" 
                      animated={true}
                    />
                    <span className="text-white">{row.userName}</span>
                  </div>
                  <span className="text-white/70 text-sm">{row.score}/{row.total}</span>
                </div>
              )) || (
                <div className="text-center py-4">
                  <p className="text-white/60">No leaderboard data yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
