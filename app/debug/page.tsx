"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugPage() {
  const [sessionCode, setSessionCode] = useState('')
  const [debugInfo, setDebugInfo] = useState('')

  const testJoin = async () => {
    try {
      const response = await fetch('/api/socket')
      const text = await response.text()
      
      setDebugInfo(`
Socket API Response: ${response.status}
Response: ${text}

Current session you're trying to join: ${sessionCode}

To join a live quiz:
1. Go to /join-live
2. Enter session code: ${sessionCode || '[Enter code above]'}
3. Enter your name
4. Click "Join Session"

The session code is NOT the session ID.
Session ID looks like: session_1759489850643
Session Code looks like: KJX5FN (6 characters)

Users join with the SESSION CODE, not the session ID.
      `)
    } catch (error) {
      setDebugInfo(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-white">Live Quiz Debug Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-white">Session Code to Test:</label>
            <Input 
              value={sessionCode}
              onChange={(e) => setSessionCode(e.target.value)}
              placeholder="Enter session code (e.g. KJX5FN)"
              className="mt-2"
            />
          </div>
          
          <Button onClick={testJoin} className="w-full">
            Test Session Join Process
          </Button>
          
          <div className="bg-gray-800 p-4 rounded text-white whitespace-pre-wrap">
            {debugInfo || 'Click button to test session joining...'}
          </div>
          
          <div className="text-sm text-gray-400">
            <h3 className="font-bold mb-2">How Live Quiz Works:</h3>
            <ol className="list-decimal list-inside space-y-1">
              <li>Admin creates session → Gets session ID + session code</li>
              <li>Admin shares session CODE with users (not session ID)</li>
              <li>Users go to /join-live and enter the session CODE</li>
              <li>Users see "Get Ready!" and wait</li>
              <li>Admin clicks "Start Quiz" or "Force Start"</li>
              <li>Users are redirected to /live-quiz/[sessionId]</li>
              <li>Users see questions with colored answer buttons</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}