import { NextApiRequest, NextApiResponse } from 'next'
import { sessionManager } from '@/lib/sessions'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { code, userName } = req.body

    console.log('🎯 User trying to join with code:', code, 'userName:', userName)
    console.log('📊 Total sessions available:', sessionManager.size())
    console.log('🗂️ Available session codes:', sessionManager.getAllSessions().map(s => s.code))

    if (!code || !userName) {
      return res.status(400).json({ error: 'Code and userName are required' })
    }

    // Find session by code
    const session = sessionManager.findSessionByCode(code)

    if (!session) {
      console.log('❌ Session not found for code:', code)
      return res.status(404).json({ error: 'Session not found' })
    }

    console.log('✅ Found session:', session.id, 'with code:', session.code)

    if (session.status !== 'waiting') {
      return res.status(400).json({ error: 'Session already started or finished' })
    }

    // Add participant
    const participant = {
      id: Date.now().toString(),
      name: userName,
      score: 0,
      answered: false,
      joinedAt: new Date()
    }

    session.participants.push(participant)
    console.log('✅ Added participant. Total participants:', session.participants.length)

    return res.status(200).json({
      success: true,
      sessionId: session.id,
      participant,
      totalParticipants: session.participants.length
    })
  }

  if (req.method === 'GET') {
    const { sessionId } = req.query

    if (sessionId) {
      const session = sessionManager.getSession(sessionId as string)
      if (session) {
        return res.status(200).json(session)
      } else {
        return res.status(404).json({ error: 'Session not found' })
      }
    }

    // Return all sessions
    const sessions = sessionManager.getAllSessions()
    return res.status(200).json(sessions)
  }

  res.status(405).json({ error: 'Method not allowed' })
}