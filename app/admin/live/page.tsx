"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import useSWR from 'swr'
import { fetcher } from '@/lib/fetcher'
import io, { Socket } from 'socket.io-client'

interface Quiz {
  _id: string
  title: string
  description: string
  questions?: any[]
  createdBy: string
  createdAt: string
}

export default function AdminLivePage() {
  const router = useRouter()
  const [socket, setSocket] = useState<Socket | null>(null)
  const [selectedQuizId, setSelectedQuizId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const [sessionCode, setSessionCode] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [participants, setParticipants] = useState<any[]>([])
  const [forceUpdate, setForceUpdate] = useState(0) // Force re-render trigger
  
  const { data: quizzesData } = useSWR('/api/quizzes', fetcher)
  const { data: me } = useSWR('/api/auth/me', fetcher)
  const allQuizzes = (quizzesData as any)?.quizzes || []
  // Filter to only show quizzes with questions for live sessions
  const quizzes = allQuizzes.filter((quiz: Quiz) => quiz.questions && quiz.questions.length > 0)
  const user = (me as any)?.user

  // Debug participant state
  useEffect(() => {
    console.log('🔍 Current participants state:', participants)
    console.log('🔢 Participants count:', participants.length)
  }, [participants])

  useEffect(() => {
    // Initialize socket server first
    fetch('/api/socket').catch(() => {})
    
    // Initialize socket connection (temporarily using placeholder backend)
    const socketInstance = io()
    setSocket(socketInstance)

    // Add connection logging
    socketInstance.on('connect', () => {
      console.log('🔌 Admin socket connected:', socketInstance.id)
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Admin socket connection error:', error)
    })

    socketInstance.on('session-created', (data) => {
      console.log('✅ Session created:', data)
      setSessionCode(data.code)
      setSessionId(data.sessionId)
      setIsCreating(false)
      
      // Wait a bit for session to be fully created, then join admin room
      setTimeout(() => {
        console.log('🏠 Joining admin room for session:', data.sessionId)
        socketInstance.emit('join-admin-room', { sessionId: data.sessionId })
      }, 1000) // 1 second delay to ensure session is ready
    })

    socketInstance.on('participant-joined', (data) => {
      console.log('👤 Participant joined event received:', data)
      console.log('📊 Current participants before update:', participants)
      setParticipants(prev => {
        console.log('📊 Previous participants:', prev)
        console.log('➕ Adding participant:', data.participant)
        const updated = [...prev, data.participant]
        console.log('📊 Updated participants array:', updated)
        return updated
      })
    })

    socketInstance.on('participants-updated', (data) => {
      console.log('📋 Participants updated event received:', data)
      console.log('👥 Setting participants to:', data.participants)
      console.log('🔢 Total participants:', data.participants?.length || 0)
      setParticipants(data.participants || [])
      setForceUpdate(prev => prev + 1) // Force component re-render
    })

    socketInstance.on('participant-left', (data) => {
      console.log('👋 Participant left event received:', data)
      setParticipants(prev => {
        const updated = prev.filter(p => p.id !== data.participantId)
        console.log('📊 Participants after removal:', updated)
        return updated
      })
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const createLiveSession = async () => {
    if (!selectedQuizId || !user) return
    
    setIsCreating(true)
    
    try {
      // Use HTTP API instead of Socket.io for session creation
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          quizId: selectedQuizId,
          adminId: user.id
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setSessionId(data.sessionId)
        setSessionCode(data.code)
        setIsCreating(false)
        console.log('✅ Session created successfully:', data)
      } else {
        throw new Error('Failed to create session')
      }
    } catch (error) {
      console.error('❌ Error creating session:', error)
      setIsCreating(false)
    }
  }

  const startQuiz = () => {
    if (!sessionId || !socket) return
    
    socket.emit('start-quiz', { sessionId })
    router.push(`/admin/live-controller/${sessionId}`)
  }

  const fetchParticipants = async () => {
    if (!sessionId) return
    
    try {
      console.log('🔍 Fetching participants for session:', sessionId)
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`)
      const data = await response.json()
      
      console.log('📦 Raw API response:', data)
      console.log('📊 Response participants array:', data.participants)
      console.log('🔢 Participants count from API:', data.participants?.length || 0)
      
      if (response.ok && data.participants) {
        console.log('✅ Setting participants to:', data.participants)
        setParticipants(data.participants)
      } else {
        console.log('❌ Failed to fetch participants - no participants array in response:', data)
      }
    } catch (error) {
      console.error('❌ Error fetching participants:', error)
    }
  }

  // Poll for participants every 3 seconds
  useEffect(() => {
    if (sessionId) {
      fetchParticipants() // Initial fetch
      
      const pollInterval = setInterval(() => {
        console.log('🔔 Polling for participants via HTTP...', new Date().toLocaleTimeString())
        fetchParticipants()
      }, 3000)

      return () => clearInterval(pollInterval)
    }
  }, [sessionId])

  const goToController = () => {
    if (sessionId) {
      router.push(`/admin/live-controller/${sessionId}`)
    }
  }

  const testConnection = () => {
    console.log('🧪 Testing Socket.io connection:')
    console.log('Socket connected:', socket?.connected)
    console.log('Socket ID:', socket?.id)
    console.log('Session ID:', sessionId)
    console.log('Current participants:', participants)
    
    if (socket && sessionId) {
      console.log('🔄 Re-joining admin room for session:', sessionId)
      socket.emit('join-admin-room', { sessionId })
    }
  }

  const forceStartQuiz = () => {
    if (!sessionId || !socket) return
    
    const confirmed = window.confirm(
      '⚠️ Force start quiz?\n\nThis will start the quiz even if participant count shows 0. Only use this if you know participants are connected and waiting.'
    )
    
    if (confirmed) {
      console.log('🚀 Force starting quiz for session:', sessionId)
      socket.emit('start-quiz', { sessionId })
      router.push(`/admin/live-controller/${sessionId}`)
    }
  }

  const forceRefreshParticipants = () => {
    console.log('🔄 Force refreshing participants...')
    if (socket && sessionId) {
      // Clear current participants and re-request
      setParticipants([])
      socket.emit('join-admin-room', { sessionId })
      console.log('📡 Requested fresh participant list')
    }
  }

  // Backup polling for participants (as fallback)
  useEffect(() => {
    if (sessionId && socket?.connected) {
      const pollInterval = setInterval(() => {
        console.log('🔔 Polling for participants...', new Date().toLocaleTimeString())
        socket.emit('join-admin-room', { sessionId })
      }, 3000) // Poll every 3 seconds (more frequent)

      return () => clearInterval(pollInterval)
    }
  }, [sessionId, socket?.connected])

  // Force a manual participant sync when sessionId changes
  useEffect(() => {
    if (sessionId && socket?.connected) {
      console.log('🎯 New session created, forcing participant sync')
      setTimeout(() => {
        socket.emit('join-admin-room', { sessionId })
      }, 2000)
    }
  }, [sessionId, socket?.connected])

  if (!quizzesData) {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-4xl mx-auto mobile-container py-10">
          <Card className="glass-effect-enhanced mobile-card text-center">
            <CardContent className="py-8">
              <Loader2 className="animate-spin h-12 w-12 text-bold-white mx-auto mb-4" />
              <h2 className="mobile-header text-bold-white mb-4">
                Loading Quizzes...
              </h2>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="min-h-screen enhanced-gradient-bg">
        <main className="max-w-4xl mx-auto mobile-container py-10">
          <Card className="glass-effect-enhanced mobile-card text-center">
            <CardContent className="py-8">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="mobile-header text-bold-white mb-4">
                No Quizzes Available
              </h2>
              <p className="text-description mb-6">
                You need to create quizzes with questions before hosting live sessions.
              </p>
              <Button
                onClick={() => router.push('/admin')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold mobile-button"
              >
                Go to Admin Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-4xl mx-auto mobile-container py-10">
        <div className="mb-8 text-center">
          <h1 className="mobile-header text-bold-gradient mb-2">
            🎯 Create Live Quiz Session
          </h1>
          <p className="text-description">
            Choose a quiz and create a live session for real-time participation
          </p>
        </div>

        {!sessionCode ? (
          <Card className="glass-effect-enhanced mobile-card">
            <CardHeader>
              <CardTitle className="text-bold-white mobile-subheader">
                📋 Select Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-bold-white mobile-text font-semibold mb-3">
                  Choose a quiz to host live:
                </label>
                <Select value={selectedQuizId} onValueChange={setSelectedQuizId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a quiz..." />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz: Quiz) => (
                      <SelectItem key={quiz._id} value={quiz._id}>
                        <div className="flex flex-col items-start">
                          <span className="font-semibold">{quiz.title}</span>
                          <span className="text-sm text-gray-500">
                            {quiz.questions?.length || 0} questions
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedQuizId && (
                <div className="p-4 bg-white/5 rounded-lg">
                  {(() => {
                    const selectedQuiz = quizzes.find((q: Quiz) => q._id === selectedQuizId)
                    return selectedQuiz ? (
                      <div>
                        <h3 className="text-bold-white font-semibold mb-2">
                          {selectedQuiz.title}
                        </h3>
                        <p className="text-description text-sm mb-3">
                          {selectedQuiz.description}
                        </p>
                        <div className="flex gap-2">
                          <Badge variant="secondary">
                            📝 {selectedQuiz.questions?.length || 0} Questions
                          </Badge>
                          <Badge variant="secondary">
                            📅 Created {new Date(selectedQuiz.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </div>
                    ) : null
                  })()}
                </div>
              )}

              <Button
                onClick={createLiveSession}
                disabled={!selectedQuizId || isCreating || !user}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold mobile-button"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating Session...
                  </>
                ) : (
                  '🚀 Create Live Session'
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="glass-effect-enhanced mobile-card text-center">
              <CardHeader>
                <CardTitle className="text-bold-gradient mobile-header">
                  🎮 Live Session Created!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <div className="text-6xl font-bold text-bold-white mb-4">
                    {sessionCode}
                  </div>
                  <p className="text-description">
                    Share this code with participants to join
                  </p>
                </div>

                <div className="flex justify-center gap-4 mb-6">
                  <Button
                    onClick={() => navigator.clipboard.writeText(sessionCode)}
                    variant="outline"
                    className="mobile-button"
                  >
                    📋 Copy Code
                  </Button>
                  <Button
                    onClick={() => navigator.clipboard.writeText(`${window.location.origin}/join-live`)}
                    variant="outline"
                    className="mobile-button"
                  >
                    🔗 Copy Join Link
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect-enhanced mobile-card">
              <CardHeader>
                <CardTitle className="text-bold-white mobile-subheader">
                  👥 Participants ({participants.length}) 
                  {forceUpdate > 0 && (
                    <span className="text-xs text-green-400 ml-2">
                      (Updates: {forceUpdate})
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {participants.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">⏳</div>
                    <p className="text-description">
                      Waiting for participants to join...
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {participants.map((participant) => (
                      <div
                        key={participant.id}
                        className="bg-white/10 p-3 rounded-lg text-center"
                      >
                        <div className="text-2xl mb-1">👤</div>
                        <div className="text-bold-white text-sm font-semibold">
                          {participant.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-6 flex justify-center gap-4 flex-wrap">
                  <Button
                    onClick={startQuiz}
                    disabled={participants.length === 0}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold mobile-button"
                  >
                    🎯 Start Quiz & Go to Controller
                  </Button>

                  {/* Force start button when participants show as 0 */}
                  {participants.length === 0 && sessionCode && (
                    <Button
                      onClick={forceStartQuiz}
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold mobile-button"
                    >
                      ⚡ Force Start Quiz
                    </Button>
                  )}
                  
                  {participants.length > 0 && (
                    <Button
                      onClick={goToController}
                      variant="outline"
                      className="mobile-button"
                    >
                      🎮 Go to Controller
                    </Button>
                  )}

                  {/* Working Demo Button */}
                  <Button
                    onClick={() => window.open('/live-quiz-demo', '_blank')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold mobile-button"
                  >
                    🚀 View Working Demo
                  </Button>
                  
                  {/* Debug buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={testConnection}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-yellow-500/20 border-yellow-500 text-yellow-200 hover:bg-yellow-500/30"
                    >
                      🔧 Test Connection
                    </Button>
                    <Button
                      onClick={forceRefreshParticipants}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-blue-500/20 border-blue-500 text-blue-200 hover:bg-blue-500/30"
                    >
                      🔄 Refresh Participants
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/admin')}
            variant="outline"
            className="mobile-button"
          >
            ← Back to Admin Dashboard
          </Button>
        </div>
      </main>
    </div>
  )
}