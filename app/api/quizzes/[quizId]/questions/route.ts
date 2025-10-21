import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import Quiz from "@/models/quiz"
import Question from "@/models/question"

export async function GET(_: Request, { params }: { params: { quizId: string } }) {
  await dbConnect()
  const quiz = await Quiz.findById(params.quizId).lean()
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
  const questions = await Question.find({ _id: { $in: quiz.questionIds } })
    .select("text options correctOptionIndex")
    .lean()
  // omit correct index in client payload for fairness; send separately on submit
  const safeQuestions = questions.map((q: any) => ({
    _id: String(q._id),
    text: q.text,
    options: q.options.map((o: any) => o.text),
  }))
  return NextResponse.json({ timeLimitSec: quiz.timeLimitSec, questions: safeQuestions })
}
