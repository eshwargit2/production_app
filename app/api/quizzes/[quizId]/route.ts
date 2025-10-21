import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import Quiz from "@/models/quiz"
import { requireAdmin } from "@/lib/auth"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    // Require admin authentication
    requireAdmin()
    
    await dbConnect()
    
    const { quizId } = params
    
    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
    }

    // Find and delete the quiz
    const deletedQuiz = await Quiz.findByIdAndDelete(quizId)
    
    if (!deletedQuiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    console.log("Quiz deleted successfully:", { quizId, title: deletedQuiz.title })
    
    return NextResponse.json({ 
      message: "Quiz deleted successfully",
      deletedQuiz: {
        _id: deletedQuiz._id,
        title: deletedQuiz.title
      }
    })
  } catch (error) {
    console.error("Delete quiz error:", error)
    if (error instanceof Response) {
      // This is an auth error from requireAdmin
      return error
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    await dbConnect()
    
    const { quizId } = params
    
    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID is required" }, { status: 400 })
    }

    const quiz = await Quiz.findById(quizId)
    
    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }
    
    return NextResponse.json({ quiz })
  } catch (error) {
    console.error("Get quiz error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}