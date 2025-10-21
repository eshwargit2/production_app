// Shared in-memory storage for live sessions
// In a production app, this would be a database

// Use global storage to persist across API calls
declare global {
  var __sessions: Map<string, LiveSession> | undefined
}

// Initialize global sessions map if it doesn't exist
if (!global.__sessions) {
  global.__sessions = new Map()
}

class SessionManager {
  private get sessions(): Map<string, LiveSession> {
    return global.__sessions!
  }

  public getSession(id: string): LiveSession | undefined {
    return this.sessions.get(id)
  }

  public setSession(id: string, session: LiveSession): void {
    console.log('💾 Storing session:', id, 'Code:', session.code)
    this.sessions.set(id, session)
    console.log('📊 Total sessions after store:', this.sessions.size)
  }

  public getAllSessions(): LiveSession[] {
    return Array.from(this.sessions.values())
  }

  public findSessionByCode(code: string): LiveSession | undefined {
    console.log('🔍 Looking for session with code:', code)
    console.log('📊 Total sessions:', this.sessions.size)
    console.log('📋 Available sessions:', Array.from(this.sessions.values()).map(s => ({ id: s.id, code: s.code })))
    
    for (const [sessionId, session] of this.sessions.entries()) {
      console.log('🔍 Comparing:', code.toUpperCase(), '===', session.code, '?', session.code === code.toUpperCase())
      if (session.code === code.toUpperCase()) {
        console.log('✅ Found matching session:', sessionId)
        return session
      }
    }
    console.log('❌ No session found with code:', code)
    return undefined
  }

  public getSessionsMap(): Map<string, LiveSession> {
    return this.sessions
  }

  public size(): number {
    return this.sessions.size
  }
}

// Export singleton instance
export const sessionManager = new SessionManager()

// Also export the Map for backward compatibility
export const liveSessions = sessionManager.getSessionsMap()

export interface LiveSession {
  id: string
  code: string
  quizId: string
  adminId: string
  status: 'waiting' | 'active' | 'finished'
  currentQuestion: number
  participants: any[]
  createdAt: Date
  quiz?: any
}

export interface Participant {
  id: string
  name: string
  score: number
  answered: boolean
  joinedAt: Date
}