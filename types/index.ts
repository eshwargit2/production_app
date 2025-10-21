export interface User {
  _id: string
  email: string
  name?: string
  isAdmin?: boolean
  avatarId?: number
  canTakeQuizzes?: boolean
}

export interface Quiz {
  _id: string
  title: string
  description: string
  category: string
  timeLimitSec: number
  questionIds?: string[]
}

export interface QuizzesResponse {
  quizzes: Quiz[]
}

export interface UserResponse {
  user: User
}

export interface LeaderboardRow {
  userName: string
  score: number
  total: number
  durationSec: number
  avatarId?: number
}

export interface LeaderboardResponse {
  rows: LeaderboardRow[]
}
