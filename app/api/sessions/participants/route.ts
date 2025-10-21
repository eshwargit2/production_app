import { NextResponse } from "next/server"

// Simple API to get session participants count
// This bypasses Socket.io and directly checks the session

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const sessionId = url.searchParams.get('sessionId')
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    // This is a simple way to access the liveSessions from the Socket.io server
    // We'll need to fetch this data from the Socket.io server
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/socket`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get-session-participants', sessionId })
    })

    if (!response.ok) {
      return NextResponse.json({ participants: [], count: 0 })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching participants:', error)
    return NextResponse.json({ participants: [], count: 0 })
  }
}