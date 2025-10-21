"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { QuizPlayer } from "@/components/quiz/quiz-player"
import { Button } from "@/components/ui/button"

export default function QuizPage({ params }: { params: { id: string } }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [hasPermission, setHasPermission] = useState(false)
  const [hasAttempted, setHasAttempted] = useState(false)
  const [attemptData, setAttemptData] = useState<any>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include"
        })
        
        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            setIsAuthenticated(true)
            setUser(data.user)
            // Remove permission check, all authenticated users can take quizzes
            setHasPermission(true)
            
            // Check if user has already attempted this quiz
            const attemptResponse = await fetch(`/api/attempts?quizId=${params.id}`, {
              credentials: "include"
            })
            
            if (attemptResponse.ok) {
              const attemptData = await attemptResponse.json()
              if (attemptData.attempts && attemptData.attempts.length > 0) {
                setHasAttempted(true)
                setAttemptData(attemptData.attempts[0]) // Get the first (most recent) attempt
              }
            }
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 border-2 border-white/20 animate-fade-in-up">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">🔍 Checking authentication...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 border-2 border-white/20 animate-fade-in-up max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
            🔒 Authentication Required
          </h1>
          <p className="text-white/80 mb-6 text-lg">
            You need to be logged in to take quizzes and track your progress!
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/login">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
                🔑 Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
                ✨ Sign Up
              </Button>
            </Link>
          </div>
          <div className="mt-4">
            <Link href="/">
              <Button variant="outline" className="glass-effect text-white border-white/30 hover:bg-white/20">
                🏠 Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ...removed permission check block...

  if (hasAttempted) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 border-2 border-white/20 animate-fade-in-up max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            ✅ Quiz Already Completed
          </h1>
          <p className="text-white/80 mb-4">
            You have already taken this quiz and cannot retake it.
          </p>
          {attemptData && (
            <div className="glass-effect rounded-lg p-4 border border-white/20 mb-6">
              <h3 className="text-white font-semibold mb-2">Your Result:</h3>
              <div className="flex justify-between text-white/80 mb-1">
                <span>Score:</span>
                <span className="font-bold">{attemptData.score}/{attemptData.total}</span>
              </div>
              <div className="flex justify-between text-white/80 mb-1">
                <span>Percentage:</span>
                <span className="font-bold">{Math.round((attemptData.score / attemptData.total) * 100)}%</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Duration:</span>
                <span className="font-bold">{Math.round(attemptData.durationSec / 60)}m {attemptData.durationSec % 60}s</span>
              </div>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/leaderboard">
              <Button className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white border-0 transform hover:scale-105 transition-all duration-300">
                🏆 View Leaderboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="glass-effect text-white border-white/30 hover:bg-white/20">
                🏠 Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg">
      <main className="max-w-3xl mx-auto px-4 py-10">
        {/* User info header */}
        <div className="mb-6 text-center animate-fade-in-up">
          <p className="text-white/80">
            📚 Taking quiz as: <span className="text-white font-semibold">{user.name || user.email}</span>
          </p>
        </div>
        <QuizPlayer quizId={params.id} />
      </main>
    </div>
  )
}
