"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import io, { Socket } from 'socket.io-client'

interface Participant {
  id: string
  name: string
  score: number
  joinedAt: string
}

export default function JoinLivePage() {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameCode, setGameCode] = useState('')
  const [userName, setUserName] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [sessionId, setSessionId] = useState('')
  const [participants, setParticipants] = useState<Participant[]>([])

  useEffect(() => {
    // Skip Socket.io initialization due to backend issues
    console.log('⚠️ Socket.io disabled in join-live page')
    
    // TODO: Re-enable when backend is fixed
    /*
    // Initialize socket server first
    fetch('/api/socket').catch(() => {})
    
    // Initialize socket connection
    const socketInstance = io()
    setSocket(socketInstance)

    // Add connection logging
    socketInstance.on('connect', () => {
      console.log('🔌 User socket connected:', socketInstance.id)
      
      // If we were already in a session and reconnected, rejoin
      if (isWaiting && gameCode && userName) {
        console.log('🔄 Reconnecting to session:', gameCode)
        socketInstance.emit('join-session', {
          code: gameCode.toUpperCase(),
          userName: userName.trim()
        })
      }
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ User socket connection error:', error)
    })

    // Socket event listeners
    socketInstance.on('joined-session', (data) => {
      console.log('✅ Successfully joined session:', data)
      setIsJoining(false)
      setIsWaiting(true)
      setSessionId(data.sessionId)
      setError('')
      
      // Store user name and session code for use in live quiz page
      localStorage.setItem('liveQuizUserName', userName.trim())
      localStorage.setItem('liveQuizSessionCode', gameCode.toUpperCase().trim())
    })

    socketInstance.on('join-error', (data) => {
      console.log('❌ Join error:', data)
      setError(data.message)
      setIsJoining(false)
    })

    socketInstance.on('participants-updated', (data) => {
      console.log('Participants updated:', data)
      setParticipants(data.participants)
    })

    socketInstance.on('quiz-started', (data) => {
      console.log('✅ Quiz started:', data)
      // Navigate to live quiz player using the sessionId from the event
      const targetSessionId = data?.sessionId || sessionId
      if (targetSessionId) {
        router.push(`/live-quiz/${targetSessionId}`)
      } else {
        console.error('❌ No sessionId available for quiz navigation')
      }
    })

    socketInstance.on('participant-joined', (data) => {
      console.log('New participant joined:', data)
    })

    socketInstance.on('participant-left', (data) => {
      console.log('Participant left:', data)
    })

    return () => {
      console.log('🔌 Cleaning up socket connection')
      socketInstance.disconnect()
    }
    */
  }, []) // Empty dependency array to prevent reconnection

  const joinSession = async () => {
    if (!gameCode.trim() || !userName.trim()) {
      setError('Please enter both game code and your name')
      return
    }

    setIsJoining(true)
    setError('')

    console.log('🎯 Attempting to join session via HTTP:', { 
      code: gameCode.toUpperCase(), 
      userName: userName.trim()
    })

    try {
      const response = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: gameCode.toUpperCase(),
          userName: userName.trim()
        })
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Successfully joined session:', data)
        
        // Store session information
        localStorage.setItem('liveQuizSessionCode', gameCode.toUpperCase())
        localStorage.setItem('liveQuizUserName', userName.trim())
        localStorage.setItem('liveQuizSessionId', data.sessionId)
        
        setSessionId(data.sessionId)
        setIsWaiting(true)
        setIsJoining(false)
        
        // Set initial participant list
        setParticipants([data.participant])
        
      } else {
        console.error('❌ Failed to join session:', data.error)
        setError(data.error || 'Failed to join session')
        setIsJoining(false)
      }
    } catch (error) {
      console.error('❌ Error joining session:', error)
      setError('Network error. Please try again.')
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinSession()
    }
  }

  if (isWaiting) {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-4xl mx-auto mobile-container py-10">
          <Card className="glass-effect-enhanced mobile-card text-center">
            <CardHeader>
              <CardTitle className="mobile-header text-bold-gradient">
                🎉 You're In!
              </CardTitle>
            </CardHeader>
            <CardContent className="mobile-spacing">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-bold-white mb-4">
                  Game Code: {gameCode}
                </div>
                <p className="text-description mobile-text">
                  Welcome, {userName}! Waiting for the quiz to start...
                </p>
              </div>

              <div className="animate-pulse mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4 animate-bounce"></div>
                <p className="text-bold-white mobile-text mb-4">
                  ⏳ Waiting for admin to start the quiz...
                </p>
                
                {/* Manual navigation for testing */}
                <Button 
                  onClick={() => router.push(`/live-quiz/${sessionId}`)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  🚀 Enter Quiz Room (Test)
                </Button>
              </div>

              {participants.length > 0 && (
                <div>
                  <h3 className="text-bold-white mobile-text mb-4">
                    👥 Participants ({participants.length}):
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {participants.map((participant, index) => (
                      <div 
                        key={participant.id}
                        className="glass-effect-enhanced p-3 rounded-lg animate-fade-in-up"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <span className="text-bold-white mobile-text">
                          {index + 1}. {participant.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                onClick={() => setIsWaiting(false)}
                className="mt-6 button-enhanced text-bold-white mobile-button"
              >
                🔙 Leave Session
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-md mx-auto mobile-container py-10 flex items-center justify-center">
        <Card className="glass-effect-enhanced mobile-card w-full">
          <CardHeader className="text-center">
            <CardTitle className="mobile-header text-bold-gradient">
              🎮 Join Live Quiz
            </CardTitle>
            <p className="text-description mobile-text mt-2">
              Enter the game code to join the quiz!
            </p>
          </CardHeader>
          <CardContent className="mobile-spacing">
            <div>
              <label className="block text-bold-white mobile-text mb-2">
                Game Code:
              </label>
              <Input
                type="text"
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter 6-digit code"
                maxLength={6}
                className="glass-effect-enhanced text-bold-white placeholder:text-white/50 border-white/30 focus:border-white/60 font-bold text-center text-2xl tracking-widest mobile-button"
              />
            </div>

            <div>
              <label className="block text-bold-white mobile-text mb-2">
                Your Name:
              </label>
              <Input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter your name"
                maxLength={20}
                className="glass-effect-enhanced text-bold-white placeholder:text-white/50 border-white/30 focus:border-white/60 font-semibold mobile-button"
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-lg p-3">
                <p className="text-red-300 mobile-text font-semibold text-center">
                  ⚠️ {error}
                </p>
              </div>
            )}

            <Button
              onClick={joinSession}
              disabled={isJoining || !gameCode.trim() || !userName.trim()}
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-bold-white font-bold mobile-button"
            >
              {isJoining ? '🔄 Joining...' : '🚀 Join Quiz!'}
            </Button>

            <div className="text-center">
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                className="button-enhanced text-bold-white mobile-button"
              >
                🏠 Back to Dashboard
              </Button>
            </div>

            <div className="text-center mt-6">
              <p className="text-description text-sm">
                💡 Get the game code from your quiz host
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}