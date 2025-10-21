"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import io, { Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'

interface Question {
  _id: string
  text: string
  options: string[]
  correctAnswer: number
}

interface Quiz {
  _id: string
  title: string
  questions: Question[]
}

interface Participant {
  id: string
  name: string
  score: number
  answered: boolean
  answerTime?: number
}

interface GameState {
  phase: 'lobby' | 'question' | 'results' | 'final-results'
  currentQuestionIndex: number
  quiz?: Quiz
  participants: Participant[]
  showingResults: boolean
}

const ANSWER_COLORS = [
  { bg: 'bg-red-500', text: 'Red', icon: '🔴' },
  { bg: 'bg-blue-500', text: 'Blue', icon: '🔵' },
  { bg: 'bg-yellow-500', text: 'Yellow', icon: '🟡' },
  { bg: 'bg-green-500', text: 'Green', icon: '🟢' }
]

export default function AdminLiveController() {
  const params = useParams()
  const sessionId = params.sessionId as string
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState>({
    phase: 'lobby',
    currentQuestionIndex: 0,
    participants: [],
    showingResults: false
  })
  const [answerStats, setAnswerStats] = useState<{[key: number]: number}>({})
  const [timeLeft, setTimeLeft] = useState(30)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [quizData, setQuizData] = useState<Quiz | null>(null)

  const { data: quizzesData } = useSWR('/api/quizzes', fetcher)
  const quizzes = (quizzesData as any)?.quizzes || []

  useEffect(() => {
    // Find the quiz for this session from URL params or localStorage
    if (quizzes.length > 0 && !quizData) {
      // For demo, use first quiz. In production, get quiz ID from session
      const selectedQuiz = quizzes[0]
      setQuizData(selectedQuiz)
      setGameState(prev => ({ ...prev, quiz: selectedQuiz }))
      
      // Store quiz data in the session
      if (socket) {
        socket.emit('set-quiz-data', {
          sessionId,
          quiz: selectedQuiz
        })
      }
    }
  }, [quizzes, quizData, socket, sessionId])

  useEffect(() => {
    // Initialize socket server first
    fetch('/api/socket').catch(() => {})
    
    // Initialize socket connection
    const socketInstance = io()
    setSocket(socketInstance)

    // Join admin room
    socketInstance.emit('join-admin-room', { sessionId })

    // Socket event listeners
    socketInstance.on('participant-joined', (data) => {
      console.log('👤 Participant joined:', data)
      setGameState(prev => ({
        ...prev,
        participants: [...prev.participants, data.participant]
      }))
    })

    socketInstance.on('participants-updated', (data) => {
      console.log('📋 Participants updated:', data)
      setGameState(prev => ({
        ...prev,
        participants: data.participants || []
      }))
    })

    socketInstance.on('participant-left', (data) => {
      console.log('Participant left:', data)
      setGameState(prev => ({
        ...prev,
        participants: prev.participants.filter(p => p.id !== data.participantId)
      }))
    })

    socketInstance.on('answer-received', (data) => {
      console.log('Answer received:', data)
      setGameState(prev => ({
        ...prev,
        participants: prev.participants.map(p => 
          p.id === data.participantId 
            ? { ...p, answered: true, answerTime: data.time }
            : p
        )
      }))
      
      // Update answer statistics
      setAnswerStats(prev => ({
        ...prev,
        [data.answer]: (prev[data.answer] || 0) + 1
      }))
    })

    return () => {
      if (timer) clearInterval(timer)
      socketInstance.disconnect()
    }
  }, [sessionId])

  const startQuiz = () => {
    if (!quizData) return
    
    setGameState(prev => ({ ...prev, phase: 'question' }))
    showQuestion(0)
  }

  const showQuestion = (questionIndex: number) => {
    if (!quizData || questionIndex >= quizData.questions.length) {
      showFinalResults()
      return
    }

    const question = quizData.questions[questionIndex]
    
    setGameState(prev => ({
      ...prev,
      phase: 'question',
      currentQuestionIndex: questionIndex,
      participants: prev.participants.map(p => ({ ...p, answered: false })),
      showingResults: false
    }))
    
    setAnswerStats({})
    setTimeLeft(20) // Set to 20 seconds as requested
    
    // Start countdown timer with auto-advance
    const intervalId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(intervalId)
          // Auto-advance when timer completes
          showQuestionResults()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setTimer(intervalId)
    
    // Emit question to all participants
    socket?.emit('show-question', {
      sessionId,
      question,
      questionIndex,
      timeLimit: 30
    })
  }

  const showQuestionResults = () => {
    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }
    
    setGameState(prev => ({ ...prev, showingResults: true }))
    
    // Calculate scores and emit results
    socket?.emit('show-results', {
      sessionId,
      answerStats,
      correctAnswer: quizData?.questions[gameState.currentQuestionIndex]?.correctAnswer
    })
  }

  const nextQuestion = () => {
    const nextIndex = gameState.currentQuestionIndex + 1
    if (quizData && nextIndex < quizData.questions.length) {
      showQuestion(nextIndex)
    } else {
      showFinalResults()
    }
  }

  const showFinalResults = () => {
    setGameState(prev => ({ ...prev, phase: 'final-results' }))
    
    const sortedParticipants = [...gameState.participants].sort((a, b) => b.score - a.score)
    
    socket?.emit('show-final-results', {
      sessionId,
      results: sortedParticipants
    })
  }

  const getCurrentQuestion = () => {
    if (!quizData) return null
    return quizData.questions[gameState.currentQuestionIndex]
  }

  if (!quizData) {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-6xl mx-auto mobile-container py-10">
          <Card className="glass-effect-enhanced mobile-card text-center">
            <CardContent className="py-8">
              <Loader2 className="animate-spin h-12 w-12 text-bold-white mx-auto mb-4" />
              <h2 className="mobile-header text-bold-white mb-4">
                Loading Quiz Data...
              </h2>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const renderLobby = () => (
    <div className="space-y-6">
      <Card className="glass-effect-enhanced mobile-card">
        <CardHeader>
          <CardTitle className="text-bold-white mobile-subheader text-center">
            🎮 Quiz Lobby - {quizData.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <div className="text-4xl font-bold text-bold-gradient mb-2">
              {sessionId}
            </div>
            <p className="text-description">Share this code with participants</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-bold-white mobile-text font-bold mb-3">
              👥 Participants ({gameState.participants.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {gameState.participants.map(participant => (
                <Badge key={participant.id} variant="secondary" className="p-2">
                  {participant.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <Button
              onClick={startQuiz}
              disabled={gameState.participants.length === 0}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold mobile-button"
            >
              🚀 Start Quiz
            </Button>

            {/* Force start button when participants show as 0 */}
            {gameState.participants.length === 0 && (
              <Button
                onClick={() => {
                  const confirmed = window.confirm(
                    '⚡ Force start quiz?\n\nThis will start the quiz even if participant count shows 0.\nOnly use this if you know participants are connected and waiting.'
                  )
                  if (confirmed) {
                    console.log('🚀 Force starting quiz from controller')
                    startQuiz()
                  }
                }}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold mobile-button"
              >
                ⚡ Force Start Quiz
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderQuestion = () => {
    const question = getCurrentQuestion()
    if (!question) return null

    const totalAnswers = Object.values(answerStats).reduce((sum, count) => sum + count, 0)
    const answeredCount = gameState.participants.filter(p => p.answered).length

    return (
      <div className="space-y-6">
        {/* Question Display */}
        <Card className="glass-effect-enhanced mobile-card">
          <CardHeader>
            <CardTitle className="text-bold-white mobile-subheader text-center">
              Question {gameState.currentQuestionIndex + 1} of {quizData?.questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <div className={`text-4xl font-bold mb-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-bold-white'}`}>
                ⏱️ {timeLeft}s
              </div>
              <p className="mobile-text text-bold-white leading-relaxed">
                {question.text || 'Loading question...'}
              </p>
            </div>
            
            <div className="flex justify-center gap-4 mb-6">
              <Badge variant="outline" className="text-bold-white">
                👥 {answeredCount}/{gameState.participants.length} answered
              </Badge>
              <Badge variant="outline" className="text-bold-white">
                📊 {totalAnswers} responses
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Answer Options with Live Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(question.options || []).map((option, index) => {
            const color = ANSWER_COLORS[index]
            const answerCount = answerStats[index] || 0
            const percentage = totalAnswers > 0 ? (answerCount / totalAnswers * 100) : 0
            const isCorrect = index === (question.correctAnswer ?? -1)

            return (
              <Card 
                key={index} 
                className={`relative overflow-hidden ${color.bg}/20 border-2 ${
                  gameState.showingResults && isCorrect ? 'border-green-400 ring-2 ring-green-400' : 'border-gray-600'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{color.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-400 mb-1">{color.text}</div>
                      <div className="text-white font-semibold">{option}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Responses:</span>
                      <span className="text-white font-bold">{answerCount}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${color.bg}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      {percentage.toFixed(1)}%
                    </div>
                  </div>

                  {gameState.showingResults && isCorrect && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg"
                    >
                      ✓
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center gap-4 flex-wrap">
          <Button
            onClick={() => {
              if (timer) {
                clearInterval(timer)
                setTimer(null)
              } else {
                const intervalId = setInterval(() => {
                  setTimeLeft(prev => Math.max(0, prev - 1))
                }, 1000)
                setTimer(intervalId)
              }
            }}
            variant="outline"
            className="mobile-button"
          >
            {timer ? '⏸️ Pause Timer' : '▶️ Resume Timer'}
          </Button>

          {!gameState.showingResults ? (
            <Button
              onClick={showQuestionResults}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold mobile-button"
            >
              ⏹️ Show Results
            </Button>
          ) : (
            <Button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold mobile-button"
            >
              {gameState.currentQuestionIndex + 1 < (quizData?.questions.length || 0) ? '➡️ Next Question' : '🏁 Final Results'}
            </Button>
          )}
        </div>
      </div>
    )
  }

  const renderFinalResults = () => {
    const sortedParticipants = [...gameState.participants].sort((a, b) => b.score - a.score)

    return (
      <div className="space-y-6">
        <Card className="glass-effect-enhanced mobile-card text-center">
          <CardHeader>
            <CardTitle className="text-bold-gradient mobile-header">
              🏆 Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-description mb-6">
              Great job everyone! Here are the final results:
            </p>
            
            <div className="space-y-3">
              {sortedParticipants.slice(0, 10).map((participant, index) => (
                <div 
                  key={participant.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-500/20 border border-yellow-500/50' :
                    index === 1 ? 'bg-gray-400/20 border border-gray-400/50' :
                    index === 2 ? 'bg-orange-500/20 border border-orange-500/50' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    } text-white`}>
                      {index + 1}
                    </span>
                    <span className="text-bold-white mobile-text font-semibold">
                      {participant.name}
                    </span>
                  </div>
                  <span className="text-bold-white mobile-text font-bold text-xl">
                    {participant.score}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-6xl mx-auto mobile-container py-10">
        <div className="mb-8 text-center">
          <h1 className="mobile-header text-bold-gradient mb-2">
            🎯 Live Quiz Controller
          </h1>
          <p className="text-description">
            Control the live quiz experience for all participants
          </p>
        </div>

        <AnimatePresence mode="wait">
          {gameState.phase === 'lobby' && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderLobby()}
            </motion.div>
          )}
          
          {gameState.phase === 'question' && (
            <motion.div
              key="question"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              {renderQuestion()}
            </motion.div>
          )}
          
          {gameState.phase === 'final-results' && (
            <motion.div
              key="final-results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              {renderFinalResults()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}