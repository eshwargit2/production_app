'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface User {
  _id: string
  email: string
  name: string
  isAdmin: boolean
  avatarId?: number
}

interface Quiz {
  _id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  questions: any[]
  timeLimit: number
}

export default function HomePage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check authentication status
    fetch('/api/auth/me')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        const userData = data?.user || null
        setUser(userData)
        
        // Redirect authenticated users - admins to admin panel, others to dashboard
        if (userData) {
          if (userData.isAdmin) {
            window.location.href = '/admin'
          } else {
            window.location.href = '/dashboard'
          }
          return
        }
      })
      .catch(() => setUser(null))

    // Fetch available quizzes
    fetch('/api/quizzes')
      .then(res => res.ok ? res.json() : [])
      .then(data => setQuizzes(data))
      .catch(() => setQuizzes([]))
      .finally(() => setIsLoading(false))
  }, [])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500'
      case 'Medium': return 'bg-yellow-500'
      case 'Hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-6xl mx-auto mobile-container py-10 mobile-spacing">
        {/* Animated Header */}
        <div className="text-center space-y-4">
          <h1 className="mobile-header animate-float text-bold-gradient">
            🎯 Animated Quiz App ✨
          </h1>
          <p className="mobile-text text-description animate-fade-in-up">
            Test your knowledge with our interactive animated quizzes
          </p>
        </div>

        {/* Auth Status & Navigation */}
        <div className="glass-effect-enhanced rounded-xl mobile-card animate-fade-in-up">
          <div className="mobile-nav">
            {user ? (
              <div className="text-bold-white">
                <span className="mobile-text">Welcome back! 👋</span>
              </div>
            ) : (
              <div className="text-description">
                <span className="mobile-text">Ready to start your quiz journey?</span>
              </div>
            )}
            
            <div className="mobile-nav-buttons">
              {user ? (
                <>
                  {user.isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                        ⚡ Admin Dashboard
                      </Button>
                    </Link>
                  )}
                  <Link href="/leaderboard">
                    <Button variant="outline" className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                      🏆 Leaderboard
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      fetch('/api/auth/logout', { method: 'POST' })
                        .then(() => window.location.reload())
                    }}
                    variant="outline" 
                    className="button-enhanced text-bold-white mobile-button w-full sm:w-auto"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="outline" className="button-enhanced text-bold-white mobile-button w-full sm:w-auto">
                      🔑 Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white font-extrabold mobile-button w-full sm:w-auto">
                      🚀 Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Available Quizzes */}
        <div className="space-y-6">
          <h2 className="mobile-subheader text-center animate-slide-in-left">
            🧠 Available Quizzes
          </h2>
          
          {isLoading ? (
            <div className="mobile-grid">
              {[1, 2, 3].map(i => (
                <Card key={i} className="glass-effect-enhanced animate-pulse mobile-card">
                  <CardHeader>
                    <div className="h-6 bg-white/20 rounded"></div>
                    <div className="h-4 bg-white/10 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : quizzes.length > 0 ? (
            <div className="mobile-grid">
              {quizzes.map((quiz, index) => (
                <Card 
                  key={quiz._id} 
                  className="quiz-card-enhanced card-hover animate-fade-in-up mobile-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                      <CardTitle className="text-bold-white mobile-text">{quiz.title}</CardTitle>
                      <Badge className={`${getDifficultyColor(quiz.difficulty)} text-bold-white font-bold text-xs px-2 py-1`}>
                        {quiz.difficulty}
                      </Badge>
                    </div>
                    <CardDescription className="text-description mobile-text">
                      {quiz.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between text-sm text-description gap-2">
                      <span className="font-semibold">📝 {quiz.questions?.length || 0} questions</span>
                      <span className="font-semibold">⏱️ {quiz.timeLimit} min</span>
                    </div>
                    
                    {user ? (
                      <Link href={`/quiz/${quiz._id}`}>
                        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-bold-white font-extrabold mobile-button">
                          Start Quiz 🚀
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/login">
                        <Button 
                          variant="outline" 
                          className="w-full button-enhanced text-bold-white mobile-button"
                        >
                          Login to Start 🔐
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="glass-effect-enhanced animate-fade-in-up mobile-card">
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="mobile-text font-semibold text-bold-white mb-2">No Quizzes Available</h3>
                <p className="text-description mobile-text">Check back later for new quizzes!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features Section */}
        <div className="mobile-grid mt-12">
          <Card className="glass-effect-enhanced animate-slide-in-left mobile-card">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="mobile-text font-bold text-bold-white mb-2">Fast & Responsive</h3>
              <p className="text-description text-sm">Lightning-fast quiz experience with smooth animations</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect-enhanced animate-fade-in-up mobile-card">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="mobile-text font-bold text-bold-white mb-2">Leaderboards</h3>
              <p className="text-description text-sm">Compete with others and track your progress</p>
            </CardContent>
          </Card>
          
          <Card className="glass-effect-enhanced animate-slide-in-right mobile-card">
            <CardContent className="text-center py-8">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="mobile-text font-bold text-bold-white mb-2">Detailed Analytics</h3>
              <p className="text-description text-sm">Get insights into your quiz performance</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
