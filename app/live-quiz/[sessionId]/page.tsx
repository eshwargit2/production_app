"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import io, { Socket } from 'socket.io-client'
import { motion, AnimatePresence } from 'framer-motion'

interface Question {
  _id: string
  text: string
  options: string[]
  correctAnswer: number
}

interface GameState {
  phase: 'waiting' | 'question' | 'results' | 'final-results'
  question?: Question
  questionIndex?: number
  timeLeft?: number
  results?: any[]
}

const ANSWER_COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', border: 'border-red-400', text: 'Red', icon: '🔴' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', border: 'border-blue-400', text: 'Blue', icon: '🔵' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', border: 'border-yellow-400', text: 'Yellow', icon: '🟡' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', border: 'border-green-400', text: 'Green', icon: '🟢' }
]

export default function LiveQuizPlayer() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params?.sessionId as string
  
  // Return early if sessionId is not available
  if (!sessionId) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 border-2 border-white/20">
          <h1 className="text-2xl font-bold text-white mb-4">Session Not Found</h1>
          <p className="text-white/80">Invalid session ID provided.</p>
        </div>
      </div>
    )
  }
  
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameState, setGameState] = useState<GameState>({ phase: 'waiting' })
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [totalScore, setTotalScore] = useState(0)
  const [userName, setUserName] = useState('Player')
  const [answerTime, setAnswerTime] = useState<number>(0)
  const [debugMode, setDebugMode] = useState(false)

  // Test question for debugging
  const testQuestion = {
    _id: 'test',
    text: 'What is 2 + 2? (Test Question)',
    options: ['3', '4', '5', '6'],
    correctAnswer: 1
  }

  useEffect(() => {
    // Initialize score from localStorage
    const savedScore = localStorage.getItem(`quiz-score-${sessionId}`)
    if (savedScore) {
      setTotalScore(parseInt(savedScore))
      console.log('📊 Restored score from localStorage:', savedScore)
    }
    
    // Skip Socket.io initialization for now due to backend issues
    console.log('⚠️ Socket.io disabled - testing local scoring only')
    
    // Set waiting state immediately for testing
    setGameState({ phase: 'waiting' })
    
    // Skip Socket.io initialization for now due to backend issues
    console.log('⚠️ Socket.io disabled - testing local scoring only')
    
    // Set waiting state immediately for testing
    setGameState({ phase: 'waiting' })
    
    // TODO: Re-enable Socket.io when backend is fixed
    /*
    // Initialize socket connection
    const socketInstance = io()
    setSocket(socketInstance)

    // Rejoin the session when entering live quiz
    socketInstance.on('connect', () => {
      console.log('🔌 Live quiz socket connected:', socketInstance.id)
      console.log('📋 Session ID from params:', sessionId)
      
      // Get user name from localStorage if available
      const storedUserName = localStorage.getItem('liveQuizUserName') || 'Player'
      console.log('👤 Stored user name:', storedUserName)
      setUserName(storedUserName)
      
      // Only rejoin if we have valid session ID
      if (sessionId && sessionId !== 'undefined') {
        console.log('🔄 Rejoining session from live quiz page:', sessionId)
        console.log('👤 Using stored username:', storedUserName)
        socketInstance.emit('rejoin-session', {
          sessionId,
          userName: storedUserName
        })
      } else {
        console.error('❌ Invalid session ID for rejoin:', sessionId)
      }
    })

    socketInstance.on('rejoined-session', (data) => {
      console.log('✅ Successfully rejoined session:', data)
      // Force set waiting state when rejoined
      setGameState({ phase: 'waiting' })
    })

    socketInstance.on('join-error', (data) => {
      console.error('❌ Failed to rejoin session:', data)
      // Try alternative join method
      console.log('🔄 Trying alternative join using session code from localStorage...')
      const sessionCode = localStorage.getItem('liveQuizSessionCode')
      const storedUserName = localStorage.getItem('liveQuizUserName') || 'Player'
      if (sessionCode) {
        console.log('📋 Found session code:', sessionCode)
        socketInstance.emit('join-session', {
          code: sessionCode,
          userName: storedUserName
        })
      } else {
        // Redirect back to join page if rejoin fails
        router.push('/join-live')
      }
    })

    // Socket event listeners
    socketInstance.on('question-shown', (data) => {
      console.log('🎯 Question shown event received:', data)
      console.log('📋 Question data:', data.question)
      console.log('📊 Question text:', data.question?.text)
      console.log('🔢 Question options:', data.question?.options)
      
      setGameState({
        phase: 'question',
        question: data.question,
        questionIndex: data.questionIndex,
        timeLeft: data.timeLimit || 20 // Use server time limit or default to 20
      })
      setSelectedAnswer(null)
      setHasAnswered(false)
      setAnswerTime(Date.now())
    })

    socketInstance.on('answer-submitted', (data) => {
      console.log('Answer feedback received:', data)
      setHasAnswered(true)
      
      // Update total score using the server's calculation
      if (data.totalScore !== undefined) {
        setTotalScore(data.totalScore)
        localStorage.setItem(`quiz-score-${sessionId}`, data.totalScore.toString())
        console.log('Score updated from server:', data.totalScore)
      }
    })

    socketInstance.on('results-shown', (data) => {
      console.log('Results shown:', data)
      setGameState({
        phase: 'final-results',
        results: data.results
      })
    })

    socketInstance.on('quiz-started', () => {
      console.log('Quiz started')
      setGameState({ phase: 'waiting' })
    })

    return () => {
      socketInstance.disconnect()
    }
    */
  }, [])

  const showTestQuestion = () => {
    console.log('🧪 Showing test question')
    setGameState({
      phase: 'question',
      question: testQuestion,
      questionIndex: 0,
      timeLeft: 30
    })
    setSelectedAnswer(null)
    setHasAnswered(false)
    setAnswerTime(Date.now())
  }

  const submitAnswer = (answerIndex: number) => {
    if (hasAnswered || !gameState.question) return

    setSelectedAnswer(answerIndex)
    setHasAnswered(true)
    
    // Calculate if answer is correct for immediate feedback
    const isCorrect = answerIndex === gameState.question.correctAnswer
    if (isCorrect) {
      // Update local score immediately for user feedback
      setScore(prev => prev + 1)
      setTotalScore(prev => {
        const newTotal = prev + 1000 // Base points for correct answer
        localStorage.setItem(`quiz-score-${sessionId}`, newTotal.toString())
        return newTotal
      })
      console.log('✅ Correct answer! Score updated')
    } else {
      console.log('❌ Wrong answer. Correct was:', gameState.question.correctAnswer)
    }
    
    const responseTime = Date.now() - answerTime
    
    // TODO: Re-enable when Socket.io backend is fixed
    /*
    socket?.emit('submit-answer', {
      sessionId,
      answer: answerIndex,
      time: responseTime,
      isCorrect
    })
    */
    console.log('📤 Would emit answer to server:', { answer: answerIndex, isCorrect, time: responseTime })
  }

  const renderWaiting = () => (
    <div className="text-center">
      <div className="animate-pulse mb-8">
        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4 animate-bounce"></div>
      </div>
      <h2 className="mobile-header text-bold-white mb-4">
        🎮 Get Ready!
      </h2>
      <p className="text-description mobile-text mb-6">
        The quiz is about to begin...
      </p>
      
      {/* Debug Test Button */}
      <div className="space-y-4">
        <button
          onClick={showTestQuestion}
          className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-3 rounded-lg"
        >
          🧪 Test Question Display
        </button>
        <div className="text-xs text-gray-400">
          Session ID: {sessionId}
        </div>
      </div>
    </div>
  )

  const renderQuestion = () => {
    if (!gameState.question) return null

    return (
      <div className="space-y-6">
        {/* Question */}
        <Card className="glass-effect-enhanced mobile-card">
          <CardContent className="text-center py-8">
            <h2 className="mobile-subheader text-bold-white mb-4">
              Question {(gameState.questionIndex || 0) + 1}
            </h2>
            <div className="mb-4">
              <p className="mobile-text text-bold-white leading-relaxed">
                {gameState.question?.text || 'Loading question...'}
              </p>
              {/* Debug info */}
              {(!gameState.question?.text) && (
                <div className="mt-2 text-sm text-yellow-400">
                  Debug: Question object = {JSON.stringify(gameState.question) || 'null'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Score Display */}
        <div className="text-center">
          <div className="inline-block glass-effect-enhanced px-6 py-3 rounded-full">
            <span className="text-bold-white mobile-text font-bold">
              💎 Score: {totalScore}
            </span>
          </div>
        </div>

        {/* Answer Options - Kahoot Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Debug info for options */}
          {(gameState.question?.options || []).length === 0 && (
            <div className="col-span-full text-center text-yellow-400 text-sm">
              Debug: No options found. Question = {JSON.stringify(gameState.question) || 'null'}
            </div>
          )}
          
          {(gameState.question?.options || []).map((option, index) => {
            const color = ANSWER_COLORS[index]
            const isSelected = selectedAnswer === index
            
            return (
              <motion.button
                key={index}
                onClick={() => submitAnswer(index)}
                disabled={hasAnswered}
                className={`
                  relative p-6 rounded-xl font-bold text-white text-left min-h-[100px] 
                  transition-all duration-300 transform hover:scale-105
                  ${color.bg} ${!hasAnswered ? color.hover : ''}
                  ${isSelected ? 'ring-4 ring-white scale-105' : ''}
                  ${hasAnswered ? 'opacity-70' : 'hover:shadow-2xl'}
                  disabled:cursor-not-allowed
                `}
                whileHover={!hasAnswered ? { scale: 1.05 } : {}}
                whileTap={!hasAnswered ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">
                    {color.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm opacity-80 mb-1">
                      {color.text}
                    </div>
                    <div className="mobile-text font-semibold">
                      {option}
                    </div>
                  </div>
                </div>
                
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 bg-white/20 rounded-xl flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="text-6xl">✓</div>
                  </motion.div>
                )}
              </motion.button>
            )
          })}
        </div>

        {hasAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <Card className="glass-effect-enhanced mobile-card">
              <CardContent className="py-6">
                <div className="text-4xl mb-4">✨</div>
                <h3 className="text-bold-white mobile-text font-bold mb-2">
                  Answer Submitted!
                </h3>
                <p className="text-description">
                  Waiting for other players...
                </p>
                <div className="mt-4">
                  <span className="text-bold-white mobile-text font-bold">
                    Your Score: {score}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    )
  }

  const renderFinalResults = () => {
    if (!gameState.results) return null

    const playerResult = gameState.results.find(r => r.name === userName)
    const playerRank = gameState.results.findIndex(r => r.name === userName) + 1

    return (
      <div className="space-y-6">
        <Card className="glass-effect-enhanced mobile-card text-center">
          <CardContent className="py-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="mobile-header text-bold-gradient mb-4">
              Quiz Complete!
            </h2>
            
            {playerResult && (
              <div className="mb-6">
                <div className="text-4xl font-bold text-bold-white mb-2">
                  #{playerRank}
                </div>
                <div className="text-bold-white mobile-text">
                  Your Final Score: <span className="font-bold">{playerResult.score}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-effect-enhanced mobile-card">
          <CardContent className="py-6">
            <h3 className="text-bold-white mobile-subheader mb-4 text-center">
              🥇 Final Leaderboard
            </h3>
            <div className="space-y-3">
              {gameState.results.slice(0, 10).map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    result.name === userName ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                    } text-white`}>
                      {index + 1}
                    </span>
                    <span className="text-bold-white mobile-text font-semibold">
                      {result.name}
                    </span>
                  </div>
                  <span className="text-bold-white mobile-text font-bold">
                    {result.score}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-bold-white font-bold mobile-button"
          >
            🏠 Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-4xl mx-auto mobile-container py-10">
        <AnimatePresence mode="wait">
          {gameState.phase === 'waiting' && (
            <motion.div
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {renderWaiting()}
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
              key="results"
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