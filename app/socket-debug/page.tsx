"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import io, { Socket } from 'socket.io-client'

export default function SocketDebugPage() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [sessionId, setSessionId] = useState('session_1759490400936') // Use latest session ID

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    const socketInstance = io()
    setSocket(socketInstance)

    socketInstance.on('connect', () => {
      addLog(`🔌 Connected with socket ID: ${socketInstance.id}`)
    })

    socketInstance.on('question-shown', (data) => {
      addLog(`🎯 Question received: ${JSON.stringify(data, null, 2)}`)
    })

    socketInstance.on('admin-question-update', (data) => {
      addLog(`👑 Admin question update: ${JSON.stringify(data, null, 2)}`)
    })

    socketInstance.on('rejoined-session', (data) => {
      addLog(`✅ Rejoined session: ${JSON.stringify(data)}`)
    })

    socketInstance.on('join-error', (data) => {
      addLog(`❌ Join error: ${JSON.stringify(data)}`)
    })

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const testRejoin = () => {
    if (!socket) return
    
    addLog(`🔄 Attempting to rejoin session: ${sessionId}`)
    socket.emit('rejoin-session', {
      sessionId,
      userName: 'TestUser'
    })
  }

  const testAdminRoom = () => {
    if (!socket) return
    
    addLog(`👑 Joining admin room for session: ${sessionId}`)
    socket.emit('join-admin-room', { sessionId })
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white">Socket.io Debug Console</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <input 
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Session ID"
              className="flex-1 p-2 bg-gray-800 text-white rounded"
            />
          </div>
          
          <div className="flex gap-4">
            <Button onClick={testRejoin} className="bg-blue-600">
              🔄 Test Rejoin Session
            </Button>
            <Button onClick={testAdminRoom} className="bg-purple-600">
              👑 Test Admin Room
            </Button>
            <Button onClick={() => setLogs([])} className="bg-red-600">
              🗑️ Clear Logs
            </Button>
          </div>
          
          <div className="bg-gray-800 p-4 rounded h-96 overflow-y-auto">
            <div className="text-green-400 font-mono text-sm">
              {logs.length === 0 ? (
                <div className="text-gray-500">No logs yet... Click buttons to test Socket.io events</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 whitespace-pre-wrap">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="text-sm text-gray-400">
            <h3 className="font-bold mb-2">Debug Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Update Session ID above with the latest session from admin</li>
              <li>Click "Test Rejoin Session" to simulate user joining</li>
              <li>Go to admin controller and start a question</li>
              <li>Check if "Question received" appears in logs</li>
              <li>If no question received, check server terminal for Socket.io logs</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}