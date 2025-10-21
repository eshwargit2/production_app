import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import { requireUser, verifyJwt, getAuthTokenFromReq } from "@/lib/auth"
import Quiz from "@/models/quiz"
import Question from "@/models/question"
import Attempt from "@/models/attempt"

export async function GET(req: NextRequest) {
  try {
    const payload = verifyJwt(getAuthTokenFromReq())
    if (!payload) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }
    
    const { searchParams } = new URL(req.url)
    const quizId = searchParams.get("quizId")
    
    await dbConnect()
    
    let query: any = { userId: payload.sub }
    if (quizId) {
      query.quizId = quizId
    }
    
    const attempts = await Attempt.find(query)
      .sort({ createdAt: -1 })
      .populate("quizId", "title")
    
    return NextResponse.json({
      attempts: attempts.map(attempt => ({
        _id: attempt._id.toString(),
        quizId: attempt.quizId,
        score: attempt.score,
        total: attempt.total,
        percentage: Math.round((attempt.score / attempt.total) * 100),
        durationSec: attempt.durationSec,
        createdAt: attempt.createdAt,
        answers: attempt.answers
      }))
    })
  } catch (error) {
    console.error("Error fetching attempts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  await dbConnect()
  const user = requireUser()
  const { quizId, answers, durationSec } = (await req.json()) as {
    quizId: string
    answers: { questionId: string; selectedIndex: number }[]
    durationSec: number
  }
  if (!quizId || !Array.isArray(answers)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

  // ...removed permission check block...

  // Check if user has already attempted this quiz
  const existingAttempt = await Attempt.findOne({ userId: user.sub, quizId })
  if (existingAttempt) {
    return NextResponse.json({ 
      error: "You have already taken this quiz and cannot retake it.",
      previousAttempt: {
        score: existingAttempt.score,
        total: existingAttempt.total,
        percentage: Math.round((existingAttempt.score / existingAttempt.total) * 100),
        date: existingAttempt.createdAt
      }
    }, { status: 409 })
  }

  const quiz = await Quiz.findById(quizId).lean()
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 })

  const qDocs = await Question.find({ _id: { $in: quiz.questionIds } }).lean()
  const correctMap = new Map(qDocs.map((q: any) => [String(q._id), q.correctOptionIndex as number]))
  let score = 0
  const evaluated = answers.map((a) => {
    const correctIndex = correctMap.get(a.questionId)
    const correct = typeof correctIndex === "number" && a.selectedIndex === correctIndex
    if (correct) score++
    return { questionId: a.questionId, selectedIndex: a.selectedIndex, correct }
  })

  const attempt = await Attempt.create({
    userId: user.sub,
    quizId,
    answers: evaluated,
    score,
    total: qDocs.length,
    durationSec: Math.max(0, Math.floor(Number(durationSec) || 0)),
  })

  console.log(`Quiz completed: User ${user.sub} scored ${score}/${qDocs.length} on quiz ${quizId}`)

  return NextResponse.json({ attemptId: String(attempt._id), score, total: qDocs.length })
}
