/**
 * Quick Test Component for Socket.io Participant Connection
 * 
 * To use this:
 * 1. Replace the content of app/join-live/page.tsx temporarily with this code
 * 2. Test if participants stay connected
 * 3. Check admin panel for participant count
 */

"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import io, { Socket } from 'socket.io-client'

export default function QuickTestJoinPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [gameCode, setGameCode] = useState('')
  const [userName, setUserName] = useState('')
  const [connectionStatus, setConnectionStatus] = useState('disconnected')
  const [joinStatus, setJoinStatus] = useState('')
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    // Initialize socket server first
    fetch('/api/socket').catch(() => {})
    
    // Initialize socket connection
    const socketInstance = io()
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      setConnectionStatus('connected')
      addLog(`🔌 Connected with ID: ${socketInstance.id}`)
    })

    socketInstance.on('disconnect', () => {
      setConnectionStatus('disconnected')
      addLog('🔌 Disconnected')
    })

    socketInstance.on('joined-session', (data) => {
      setJoinStatus('joined')
      addLog(`✅ Joined session: ${JSON.stringify(data)}`)
    })

    socketInstance.on('join-error', (data) => {
      setJoinStatus('error')
      addLog(`❌ Join error: ${data.message}`)
    })

    // DO NOT disconnect on cleanup - let it stay connected
    return () => {
      addLog('🧹 Component cleanup (socket staying connected)')
    }
  }, [])

  const testJoin = () => {
    if (!gameCode || !userName || !socket) return
    
    addLog(`🎯 Attempting to join session: ${gameCode} as ${userName}`)
    setJoinStatus('joining')
    
    socket.emit('join-session', {
      code: gameCode.toUpperCase(),
      userName: userName.trim()
    })
  }

  const forceDisconnect = () => {
    if (socket) {
      socket.disconnect()
      addLog('🔌 Manually disconnected socket')
    }
  }

  return (
    <div className="min-h-screen enhanced-gradient-bg">
      <main className="max-w-4xl mx-auto mobile-container py-10">
        <Card className="glass-effect-enhanced mobile-card">
          <CardHeader>
            <CardTitle className="mobile-header text-bold-gradient">
              🧪 Socket.io Test Page
            </CardTitle>
          </CardHeader>
          <CardContent className="mobile-spacing">
            <div className="space-y-4">
              <div>
                <p><strong>Connection Status:</strong> 
                  <span className={connectionStatus === 'connected' ? 'text-green-500' : 'text-red-500'}>
                    {connectionStatus}
                  </span>
                </p>
                <p><strong>Join Status:</strong> 
                  <span className={joinStatus === 'joined' ? 'text-green-500' : joinStatus === 'error' ? 'text-red-500' : 'text-yellow-500'}>
                    {joinStatus || 'not attempted'}
                  </span>
                </p>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Session Code (e.g., M9E0BU)"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                />
                <Input
                  type="text"
                  placeholder="Your Name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <div className="space-x-2">
                <Button onClick={testJoin} disabled={!gameCode || !userName || connectionStatus !== 'connected'}>
                  Test Join Session
                </Button>
                <Button onClick={forceDisconnect} variant="destructive">
                  Force Disconnect
                </Button>
              </div>

              <div className="mt-6">
                <h3 className="font-bold mb-2">Debug Logs:</h3>
                <div className="bg-black/20 p-4 rounded text-sm font-mono max-h-60 overflow-y-auto">
                  {logs.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              </div>

              <div className="mt-4 text-sm text-description">
                <p><strong>Instructions:</strong></p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create a live session in admin panel first</li>
                  <li>Enter the session code and your name above</li>
                  <li>Click "Test Join Session"</li>
                  <li>Check admin panel - participant should appear and STAY</li>
                  <li>Check debug logs for any disconnection issues</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}