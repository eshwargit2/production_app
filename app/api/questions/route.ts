import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import Question from "@/models/question"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  await dbConnect()
  const questions = await Question.find({}).select("text options correctOptionIndex category difficulty")
  return NextResponse.json({ questions })
}

export async function POST(req: Request) {
  await dbConnect()
  requireAdmin()
  
  const body = await req.json()
  const { text, options, correctOptionIndex, category, difficulty } = body
  
  if (!text) {
    return NextResponse.json({ error: "Question text required" }, { status: 400 })
  }
  
  if (!options || !Array.isArray(options) || options.length < 2) {
    return NextResponse.json({ error: "At least 2 options required" }, { status: 400 })
  }
  
  if (correctOptionIndex === undefined || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
    return NextResponse.json({ error: "Valid correct option index required" }, { status: 400 })
  }
  
  const question = await Question.create({
    text,
    options: options.map((opt: any) => ({ text: typeof opt === 'string' ? opt : opt.text })),
    correctOptionIndex,
    category: category || "General",
    difficulty: difficulty || "easy"
  })
  
  return NextResponse.json({ question })
}