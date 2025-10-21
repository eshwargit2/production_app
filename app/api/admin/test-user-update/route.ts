import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"
import { requireAdmin } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    console.log("🧪 Manual user permission test starting...")
    
    requireAdmin()
    await dbConnect()
    
    const { testUserId, testPermission } = await req.json()
    
    console.log("Test parameters:", { testUserId, testPermission })
    
    // First, let's find the user to see current state
    const currentUser = await User.findById(testUserId).select("email name canTakeQuizzes isAdmin")
    
    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    console.log("Current user state:", {
      email: currentUser.email,
      name: currentUser.name,
      canTakeQuizzes: currentUser.canTakeQuizzes,
      isAdmin: currentUser.isAdmin
    })
    
    // Now try to update
    const updatedUser = await User.findByIdAndUpdate(
      testUserId,
      { canTakeQuizzes: testPermission },
      { new: true, select: "email name canTakeQuizzes isAdmin" }
    )
    
    console.log("Updated user state:", {
      email: updatedUser.email,
      name: updatedUser.name,
      canTakeQuizzes: updatedUser.canTakeQuizzes,
      isAdmin: updatedUser.isAdmin
    })
    
    return NextResponse.json({
      success: true,
      before: {
        email: currentUser.email,
        canTakeQuizzes: currentUser.canTakeQuizzes
      },
      after: {
        email: updatedUser.email,
        canTakeQuizzes: updatedUser.canTakeQuizzes
      }
    })
    
  } catch (error) {
    console.error("Manual test error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}