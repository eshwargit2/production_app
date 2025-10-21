import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import Quiz from "@/models/quiz"
import Question from "@/models/question" // Import Question model to register schema
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  await dbConnect()
  
  // First, get all quizzes without population
  const quizzes = await Quiz.find({})
    .select("title description category timeLimitSec questionIds")
    .lean()
  
  // Transform and add actual question data for each quiz
  const quizzesWithQuestions = await Promise.all(
    quizzes.map(async (quiz) => {
      // Get actual question objects, not just IDs
      const questionsFromDB = await Question.find({
        _id: { $in: quiz.questionIds || [] }
      }).lean()
      
      // Transform questions to match expected format
      const questions = questionsFromDB.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options.map((opt: any) => opt.text), // Convert {text: "..."} to "..."
        correctAnswer: q.correctOptionIndex // Convert correctOptionIndex to correctAnswer
      }))
      
      const questionCount = questions.length
      return {
        ...quiz,
        questions: questions, // Transformed question objects
        questionCount
      }
    })
  )
  
  return NextResponse.json({ quizzes: quizzesWithQuestions })
}

export async function POST(req: Request) {
  await dbConnect()
  requireAdmin()
  const body = await req.json()
  const { title, description, category, timeLimitSec } = body
  if (!title) return NextResponse.json({ error: "Title required" }, { status: 400 })
  const quiz = await Quiz.create({
    title,
    description: description || "",
    category: category || "General",
    timeLimitSec: timeLimitSec || 60,
    questionIds: [],
  })
  return NextResponse.json({ quiz })
}
