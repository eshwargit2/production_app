"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Circle, Trophy, Target, Zap } from "lucide-react"

type Q = { _id: string; text: string; options: string[] }

export function QuizPlayer({ quizId, timeLimitSec }: { quizId: string; timeLimitSec?: number }) {
  const { data } = useSWR<{ timeLimitSec: number; questions: Q[] }>(`/api/quizzes/${quizId}/questions`, fetcher)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: string; selectedIndex: number }[]>([])
  const [remaining, setRemaining] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState<{ score: number; total: number } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const startTs = useRef<number | null>(null)

  const questions = data?.questions || []
  const timePerQuestion = 30 // 30 seconds per question

  useEffect(() => {
    if (!startTs.current) startTs.current = Date.now()
    // Reset timer to 30 seconds for each new question
    setRemaining(timePerQuestion)
    setShowWarning(false)
  }, [index, questions.length])

  useEffect(() => {
    if (remaining === null) return
    const t = setInterval(() => {
      setRemaining((s) => {
        if (s === null) return null
        if (s <= 1) {
          // Time's up for this question, move to next or submit
          if (index < questions.length - 1) {
            setIndex(prev => prev + 1)
            return timePerQuestion
          } else {
            handleSubmit()
            return 0
          }
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [index, questions.length])

  useEffect(() => {
    // Show warning when 10 seconds left for current question
    if (remaining === 10) setShowWarning(true)
    if (remaining === timePerQuestion) setShowWarning(false)
  }, [remaining])

  const progress = useMemo(() => ((index + 1) / Math.max(questions.length, 1)) * 100, [index, questions.length])
  const answeredCount = answers.filter(a => a !== undefined).length
  const currentAnswer = answers[index]

  async function handleSelect(optionIdx: number) {
    const q = questions[index]
    if (!q) return
    const next = [...answers]
    next[index] = { questionId: q._id, selectedIndex: optionIdx }
    setAnswers(next)
  }

  function nextQuestion() {
    if (index < questions.length - 1) {
      setIndex(i => i + 1)
      // Timer will automatically reset in useEffect
    }
  }

  function prevQuestion() {
    if (index > 0) {
      setIndex(i => i - 1)
      // Timer will automatically reset in useEffect
    }
  }

  async function handleSubmit() {
    if (!questions.length || submitted || isSubmitting) return
    setIsSubmitting(true)
    const durationSec = startTs.current ? Math.floor((Date.now() - startTs.current) / 1000) : 0
    
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quizId, answers, durationSec }),
      })
      const json = await res.json()
      if (res.ok) {
        setSubmitted({ score: json.score, total: json.total })
      } else {
        // Handle retake error specifically
        if (res.status === 409 && json.previousAttempt) {
          const { score, total, percentage, date } = json.previousAttempt
          alert(`${json.error}\n\nYour previous result:\nScore: ${score}/${total} (${percentage}%)\nDate: ${new Date(date).toLocaleDateString()}`)
        } else {
          alert(json.error || "Failed to submit")
        }
      }
    } catch (error) {
      alert("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const q = questions[index]
  const timeColor = remaining && remaining <= 10 ? "text-red-400" : remaining && remaining <= 20 ? "text-yellow-400" : "text-green-400"
  const scorePercentage = submitted ? Math.round((submitted.score / submitted.total) * 100) : 0

  if (!questions.length && data) {
    return (
      <div className="min-h-screen enhanced-gradient-bg flex items-center justify-center">
        <div className="glass-effect-enhanced rounded-xl p-8 animate-fade-in-up text-center">
          <h2 className="heading-secondary mb-4">📝 No Questions Available</h2>
          <p className="text-description">This quiz doesn't have any questions yet.</p>
          <Button className="mt-4 bg-gradient-to-r from-blue-500 to-purple-500 text-bold-white font-bold" onClick={() => window.history.back()}>
            🔙 Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <div className="max-w-4xl mx-auto mobile-container py-8 mobile-spacing">
        {/* Header with Progress and Timer */}
        <motion.div 
          className="glass-effect-enhanced rounded-xl mobile-card"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mobile-nav mb-4">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              <h1 className="mobile-subheader text-bold-gradient">
                Quiz Challenge
              </h1>
            </div>
            <div className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full glass-effect-enhanced ${timeColor} font-bold`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-extrabold text-base sm:text-lg">
                {remaining || 0}s
              </span>
              <span className="text-xs sm:text-sm font-semibold opacity-75">per question</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row justify-between text-description text-sm font-semibold gap-1">
              <span>Question {index + 1} of {questions.length}</span>
              <span>{answeredCount}/{questions.length} answered • 30s per question</span>
            </div>
            <div className="h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                style={{ width: `${progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* Question Navigator */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i === index 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-110' 
                    : answers[i] !== undefined
                    ? 'bg-green-500/80 text-white'
                    : 'bg-white/20 text-white/60 hover:bg-white/30'
                }`}
              >
                {i === index ? (
                  <Circle className="w-4 h-4" />
                ) : answers[i] !== undefined ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Time Warning */}
        <AnimatePresence>
          {showWarning && remaining && remaining <= 10 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass-effect rounded-xl p-4 border-2 border-red-400/50 bg-red-500/10"
            >
              <div className="flex items-center justify-center gap-2 text-red-300">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="font-bold">⚠️ Only {remaining} seconds left for this question!</span>
                <Zap className="w-5 h-5 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          {!submitted && q && (
            <motion.div
              key={q._id + index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Card className="quiz-card-enhanced bg-transparent mobile-card">
                <CardHeader className="pb-4">
                  <CardTitle className="text-enhanced text-bold-white leading-relaxed mobile-text">
                    {q.text}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {q.options.map((opt, i) => {
                    const isSelected = currentAnswer?.selectedIndex === i
                    return (
                      <motion.button
                        key={i}
                        type="button"
                        onClick={() => handleSelect(i)}
                        className={`mobile-quiz-option rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] ${
                          isSelected 
                            ? 'bg-gradient-to-r from-green-500 to-teal-500 text-bold-white shadow-lg font-bold' 
                            : 'glass-effect-enhanced text-bold-white hover:bg-white/15'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-sm sm:text-base ${
                            isSelected ? 'bg-white/30' : 'bg-white/20'
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="mobile-text font-semibold">{opt}</span>
                        </div>
                      </motion.button>
                    )
                  })}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Results Screen */}
          {submitted && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <div className="glass-effect-enhanced rounded-xl p-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                </motion.div>
                
                <h2 className="heading-primary mb-4 text-bold-gradient">
                  🎉 Quiz Complete! 🎉
                </h2>
                
                <div className="space-y-4">
                  <div className="text-6xl font-extrabold text-bold-white">
                    {submitted.score}/{submitted.total}
                  </div>
                  
                  <div className="text-2xl text-description">
                    Score: <span className={`font-extrabold ${scorePercentage >= 80 ? 'text-green-400' : scorePercentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {scorePercentage}%
                    </span>
                  </div>

                  <div className={`text-lg px-6 py-3 rounded-full font-bold ${
                    scorePercentage >= 80 ? 'bg-green-500/20 text-green-300' :
                    scorePercentage >= 60 ? 'bg-yellow-500/20 text-yellow-300' :
                    'bg-red-500/20 text-red-300'
                  }`}>
                    {scorePercentage >= 80 ? '🌟 Excellent work!' :
                     scorePercentage >= 60 ? '👍 Good job!' :
                     '💪 Keep practicing!'}
                  </div>
                </div>

                <div className="flex gap-4 justify-center mt-8">
                  <Button 
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-bold-white border-0 transform hover:scale-105 transition-all duration-300 font-extrabold"
                  >
                    🔄 Try Again
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="button-enhanced text-bold-white transform hover:scale-105 transition-all duration-300"
                  >
                    📊 Dashboard
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/leaderboard'}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-bold-white border-0 transform hover:scale-105 transition-all duration-300 font-extrabold"
                  >
                    🏆 Leaderboard
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Controls */}
        {!submitted && questions.length > 0 && (
          <motion.div 
            className="glass-effect-enhanced rounded-xl mobile-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mobile-nav">
              <Button
                type="button"
                onClick={prevQuestion}
                disabled={index === 0}
                className="button-enhanced text-bold-white disabled:opacity-50 disabled:cursor-not-allowed mobile-button w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="mobile-nav-buttons">
                {index < questions.length - 1 ? (
                  <Button 
                    type="button" 
                    onClick={nextQuestion}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-bold-white border-0 font-bold mobile-button w-full sm:w-auto"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button 
                    type="button" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-bold-white border-0 transform hover:scale-105 transition-all duration-300 font-extrabold mobile-button w-full sm:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        🎯 Submit Quiz
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
