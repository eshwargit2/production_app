import { NextApiRequest, NextApiResponse } from 'next'
import { sessionManager } from '@/lib/sessions'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Create new session
    const { quizId, adminId } = req.body
    
    const sessionId = `session_${Date.now()}`
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const session = {
      id: sessionId,
      code,
      quizId,
      adminId,
      status: 'waiting' as const,
      currentQuestion: -1,
      participants: [],
      createdAt: new Date()
    }
    
    sessionManager.setSession(sessionId, session)
    
    // Debug logging
    console.log('✅ Session created:', sessionId, 'Code:', code)
    console.log('📊 Total sessions in memory:', sessionManager.size())
    console.log('🗂️ All session codes:', sessionManager.getAllSessions().map(s => s.code))
    
    res.status(200).json({ 
      success: true, 
      sessionId, 
      code,
      session
    })
  } else if (req.method === 'GET') {
    // Prevent caching for real-time data
    res.setHeader('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    
    const { sessionId } = req.query
    
    if (sessionId) {
      // Get specific session
      const session = sessionManager.getSession(sessionId as string)
      if (session) {
        console.log(`📊 Fetching session ${sessionId}: ${session.participants.length} participants`)
        res.status(200).json(session)
      } else {
        res.status(404).json({ error: 'Session not found' })
      }
    } else {
      // Get all sessions
      const allSessions = sessionManager.getAllSessions()
      res.status(200).json({ sessions: allSessions })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}