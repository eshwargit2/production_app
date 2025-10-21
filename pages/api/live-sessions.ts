import { NextApiRequest, NextApiResponse } from 'next'
import { liveSessions, generateSessionCode } from '@/lib/socket'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { quizId, adminId } = req.body
      
      if (!quizId || !adminId) {
        return res.status(400).json({ error: 'Missing required fields' })
      }
      
      const sessionId = `session_${Date.now()}`
      const code = generateSessionCode()
      
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
      
      liveSessions.set(sessionId, session)
      
      res.status(201).json({ 
        sessionId, 
        code,
        session 
      })
    } catch (error) {
      console.error('Error creating live session:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else if (req.method === 'GET') {
    try {
      const { sessionId } = req.query
      
      if (sessionId) {
        const session = liveSessions.get(sessionId as string)
        if (!session) {
          return res.status(404).json({ error: 'Session not found' })
        }
        return res.status(200).json({ session })
      }
      
      // Return all sessions (for admin)
      const sessions = Array.from(liveSessions.values())
      res.status(200).json({ sessions })
    } catch (error) {
      console.error('Error fetching live sessions:', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  } else {
    res.setHeader('Allow', ['POST', 'GET'])
    res.status(405).json({ error: 'Method not allowed' })
  }
}