import { NextResponse } from "next/server"
import { verifyJwt, getAuthTokenFromReq } from "@/lib/auth"
import { dbConnect } from "@/lib/mongodb"
import Attempt from "@/models/attempt"
import User from "@/models/user"

export async function GET() {
  try {
    const payload = verifyJwt(getAuthTokenFromReq())
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    await dbConnect()
    
    // Get user attempts
    const attempts = await Attempt.find({ userId: payload.sub }).sort({ createdAt: -1 })
    
    // Calculate statistics
    const totalAttempts = attempts.length
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
    const totalPossible = attempts.reduce((sum, attempt) => sum + attempt.total, 0)
    const totalTime = attempts.reduce((sum, attempt) => sum + attempt.durationSec, 0)
    
    const averageScore = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0
    
    // Get user's rank
    const allUsers = await User.find({ canTakeQuizzes: true }).select("_id")
    const userRankings = []
    
    for (const user of allUsers) {
      const userAttempts = await Attempt.find({ userId: user._id })
      const userTotalScore = userAttempts.reduce((sum, attempt) => sum + attempt.score, 0)
      const userTotalPossible = userAttempts.reduce((sum, attempt) => sum + attempt.total, 0)
      const userAverage = userTotalPossible > 0 ? (userTotalScore / userTotalPossible) * 100 : 0
      
      userRankings.push({
        userId: user._id.toString(),
        averageScore: userAverage,
        totalAttempts: userAttempts.length
      })
    }
    
    // Sort by average score (descending) and total attempts (descending)
    userRankings.sort((a, b) => {
      if (b.averageScore !== a.averageScore) {
        return b.averageScore - a.averageScore
      }
      return b.totalAttempts - a.totalAttempts
    })
    
    const userRank = userRankings.findIndex(ranking => ranking.userId === payload.sub) + 1
    const totalUsers = userRankings.length
    
    return NextResponse.json({
      statistics: {
        completedQuizzes: totalAttempts,
        averageScore: averageScore,
        rank: userRank > 0 ? userRank : null,
        totalUsers: totalUsers,
        timeSpentMinutes: Math.round(totalTime / 60),
        attempts: attempts.map(attempt => ({
          quizId: attempt.quizId,
          score: attempt.score,
          total: attempt.total,
          percentage: Math.round((attempt.score / attempt.total) * 100),
          duration: attempt.durationSec,
          date: attempt.createdAt
        }))
      }
    })
  } catch (error) {
    console.error("Error fetching user statistics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}