"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

const DEMO_QUIZ = {
  title: "Demo Live Quiz - Math Basics",
  questions: [
    {
      text: "What is 2 + 2?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 1
    },
    {
      text: "What is 10 × 3?",
      options: ["20", "30", "40", "50"],
      correctAnswer: 1
    },
    {
      text: "What is 15 ÷ 3?",
      options: ["3", "4", "5", "6"],
      correctAnswer: 2
    }
  ]
}

const ANSWER_COLORS = [
  { bg: 'bg-red-500', hover: 'hover:bg-red-600', text: 'Red', icon: '🔴' },
  { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'Blue', icon: '🔵' },
  { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', text: 'Yellow', icon: '🟡' },
  { bg: 'bg-green-500', hover: 'hover:bg-green-600', text: 'Green', icon: '🟢' }
]

export default function LiveQuizDemo() {
  const [gamePhase, setGamePhase] = useState('lobby') // lobby, question, results, finished
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false)

  useEffect(() => {
    if (gamePhase === 'question' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      
      if (timeLeft === 1) {
        showResults()
      }
      
      return () => clearTimeout(timer)
    }
  }, [gamePhase, timeLeft])

  const startQuiz = () => {
    setGamePhase('question')
    setCurrentQuestion(0)
    setTimeLeft(30)
    setScore(0)
    setSelectedAnswer(null)
    setShowCorrectAnswer(false)
  }

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    
    // Check if correct
    const question = DEMO_QUIZ.questions[currentQuestion]
    if (answerIndex === question.correctAnswer) {
      setScore(score + 1)
    }
    
    // Show results after short delay
    setTimeout(() => {
      showResults()
    }, 1000)
  }

  const showResults = () => {
    setShowCorrectAnswer(true)
    setGamePhase('results')
    
    // Auto proceed to next question
    setTimeout(() => {
      nextQuestion()
    }, 3000)
  }

  const nextQuestion = () => {
    if (currentQuestion < DEMO_QUIZ.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(30)
      setSelectedAnswer(null)
      setShowCorrectAnswer(false)
      setGamePhase('question')
    } else {
      setGamePhase('finished')
    }
  }

  const resetQuiz = () => {
    setGamePhase('lobby')
    setCurrentQuestion(0)
    setTimeLeft(30)
    setSelectedAnswer(null)
    setScore(0)
    setShowCorrectAnswer(false)
  }

  if (gamePhase === 'lobby') {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-4xl mx-auto mobile-container py-10">
          <Card className="glass-effect-enhanced mobile-card text-center">
            <CardHeader>
              <CardTitle className="mobile-header text-bold-white">
                🚀 Live Quiz Demo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h2 className="mobile-subheader text-bold-white mb-4">
                  {DEMO_QUIZ.title}
                </h2>
                <div className="flex justify-center gap-4 mb-6">
                  <Badge variant="outline" className="text-bold-white">
                    📝 {DEMO_QUIZ.questions.length} Questions
                  </Badge>
                  <Badge variant="outline" className="text-bold-white">
                    ⏱️ 30 seconds per question
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="mobile-text text-bold-white">
                  This is a working demonstration of the Kahoot-style live quiz system.
                  Click start to experience the colored answer buttons and real-time gameplay!
                </p>
                
                <Button
                  onClick={startQuiz}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold mobile-button w-full"
                >
                  🚀 Start Demo Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (gamePhase === 'finished') {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-4xl mx-auto mobile-container py-10">
          <Card className="glass-effect-enhanced mobile-card text-center">
            <CardHeader>
              <CardTitle className="mobile-header text-bold-white">
                🎉 Quiz Complete!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="mobile-subheader text-bold-white">
                Final Score: {score}/{DEMO_QUIZ.questions.length}
              </h2>
              <p className="mobile-text text-bold-white">
                {score === DEMO_QUIZ.questions.length ? 'Perfect score! Amazing!' :
                 score >= DEMO_QUIZ.questions.length / 2 ? 'Great job!' :
                 'Keep practicing!'}
              </p>
              <Button
                onClick={resetQuiz}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold mobile-button"
              >
                🔄 Play Again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const question = DEMO_QUIZ.questions[currentQuestion]

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-4xl mx-auto mobile-container py-6">
        {/* Question Header */}
        <Card className="glass-effect-enhanced mobile-card mb-6">
          <CardContent className="text-center py-6">
            <div className="flex justify-between items-center mb-4">
              <Badge variant="outline" className="text-bold-white">
                Question {currentQuestion + 1}/{DEMO_QUIZ.questions.length}
              </Badge>
              <Badge variant="outline" className="text-bold-white">
                Score: {score}
              </Badge>
            </div>
            
            <div className={`text-5xl font-bold mb-4 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-bold-white'}`}>
              ⏱️ {timeLeft}s
            </div>
            
            <h2 className="mobile-subheader text-bold-white leading-relaxed">
              {question.text}
            </h2>
          </CardContent>
        </Card>

        {/* Answer Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const color = ANSWER_COLORS[index]
            const isSelected = selectedAnswer === index
            const isCorrect = index === question.correctAnswer
            const showResult = showCorrectAnswer

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all duration-200 mobile-card ${color.bg}/20 border-2 ${
                    isSelected
                      ? 'border-white ring-4 ring-white/50'
                      : showResult && isCorrect
                      ? 'border-green-400 ring-4 ring-green-400/50'
                      : 'border-gray-600 hover:border-gray-400'
                  }`}
                  onClick={() => selectAnswer(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{color.icon}</div>
                      <div className="flex-1">
                        <div className="text-sm text-gray-400 mb-1">{color.text}</div>
                        <div className="text-white font-semibold mobile-text">{option}</div>
                      </div>
                      {showResult && isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-green-400 text-2xl"
                        >
                          ✓
                        </motion.div>
                      )}
                      {showResult && isSelected && !isCorrect && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-red-400 text-2xl"
                        >
                          ✗
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {gamePhase === 'results' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="glass-effect-enhanced mobile-card text-center">
              <CardContent className="py-6">
                <div className="text-4xl mb-2">
                  {selectedAnswer === question.correctAnswer ? '🎉' : '😔'}
                </div>
                <p className="mobile-text text-bold-white">
                  {selectedAnswer === question.correctAnswer 
                    ? 'Correct! Well done!' 
                    : `Incorrect! The correct answer was ${question.options[question.correctAnswer]}`
                  }
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  )
}