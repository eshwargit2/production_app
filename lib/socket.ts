import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io: ServerIO
    }
  }
}

export interface LiveSession {
  id: string
  code: string
  quizId: string
  adminId: string
  status: 'waiting' | 'active' | 'finished'
  currentQuestion: number
  participants: Participant[]
  createdAt: Date
  quiz?: any
  questionStartTime?: Date
  answers: Map<string, QuestionAnswer>
}

export interface Participant {
  id: string
  name: string
  socketId: string
  score: number
  answered: boolean
  answerTime?: number
  joinedAt: Date
}

export interface QuestionAnswer {
  participantId: string
  answer: number
  time: number
  timestamp: Date
}

export interface LiveQuizQuestion {
  _id: string
  text: string
  options: string[]
  correctAnswer: number
}

// In-memory storage for live sessions (in production, use Redis)
export const liveSessions = new Map<string, LiveSession>()

export function generateSessionCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export function findSessionByCode(code: string): LiveSession | undefined {
  for (const session of liveSessions.values()) {
    if (session.code === code) {
      return session
    }
  }
  return undefined
}

export function createLiveSession(quizId: string, adminId: string): LiveSession {
  const sessionId = generateSessionCode()
  const session: LiveSession = {
    id: sessionId,
    code: sessionId,
    quizId,
    adminId,
    participants: [],
    currentQuestion: 0,
    status: 'waiting',
    createdAt: new Date(),
    answers: new Map()
  }
  
  liveSessions.set(sessionId, session)
  return session
}

export function joinSession(sessionId: string, participantName: string, socketId: string): { success: boolean, participant?: Participant } {
  const session = liveSessions.get(sessionId)
  if (!session || session.status === 'finished') {
    return { success: false }
  }
  
  const participant: Participant = {
    id: Math.random().toString(36).substring(2, 15),
    name: participantName,
    score: 0,
    socketId,
    answered: false,
    joinedAt: new Date()
  }
  
  session.participants.push(participant)
  return { success: true, participant }
}

export function leaveSession(sessionId: string, participantId: string): boolean {
  const session = liveSessions.get(sessionId)
  if (!session) return false
  
  session.participants = session.participants.filter(p => p.id !== participantId)
  return true
}

export function submitAnswer(sessionId: string, participantId: string, answer: number, responseTime: number): { success: boolean, score?: number } {
  const session = liveSessions.get(sessionId)
  if (!session || !session.quiz) return { success: false }
  
  const participant = session.participants.find(p => p.id === participantId)
  if (!participant || participant.answered) return { success: false }
  
  const currentQuestion = session.quiz.questions[session.currentQuestion]
  if (!currentQuestion) return { success: false }
  
  const isCorrect = answer === currentQuestion.correctAnswer
  let points = 0
  
  if (isCorrect) {
    // Kahoot-style scoring: base points + time bonus
    const basePoints = 1000
    const timeBonus = Math.max(0, Math.floor((30000 - responseTime) / 30)) // Max 1000 bonus points
    points = basePoints + timeBonus
  }
  
  // Update participant
  participant.answered = true
  participant.answerTime = responseTime
  participant.score += points
  
  // Store answer
  const answerKey = `${session.currentQuestion}-${participantId}`
  session.answers.set(answerKey, {
    participantId,
    answer,
    time: responseTime,
    timestamp: new Date()
  })
  
  return { success: true, score: participant.score }
}

export function getSession(sessionId: string): LiveSession | undefined {
  return liveSessions.get(sessionId)
}

export function getSessionAnswerStats(sessionId: string, questionIndex: number): {[key: number]: number} {
  const session = liveSessions.get(sessionId)
  if (!session) return {}
  
  const stats: {[key: number]: number} = {}
  
  session.answers.forEach((answer, key) => {
    if (key.startsWith(`${questionIndex}-`)) {
      stats[answer.answer] = (stats[answer.answer] || 0) + 1
    }
  })
  
  return stats
}

export function resetQuestionAnswers(sessionId: string): void {
  const session = liveSessions.get(sessionId)
  if (!session) return
  
  // Reset answered status for all participants
  session.participants.forEach(participant => {
    participant.answered = false
    participant.answerTime = undefined
  })
}

export function calculateFinalResults(sessionId: string): Participant[] {
  const session = liveSessions.get(sessionId)
  if (!session) return []
  
  return session.participants.sort((a, b) => b.score - a.score)
}