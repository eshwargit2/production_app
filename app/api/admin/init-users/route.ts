import { NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"
import { requireAdmin } from "@/lib/auth"

export async function POST() {
  try {
    requireAdmin()
    await dbConnect()
    
    console.log("Initializing existing users with canTakeQuizzes field...")
    
    // Update all users that don't have the canTakeQuizzes field set
    const result = await User.updateMany(
      { canTakeQuizzes: { $exists: false } },
      { $set: { canTakeQuizzes: true } }
    )
    
    console.log(`Updated ${result.modifiedCount} users with canTakeQuizzes: true`)
    
    // Get all non-admin users to check their status
    const users = await User.find({ isAdmin: false })
      .select("email name canTakeQuizzes")
      .lean()
    
    return NextResponse.json({
      message: `Successfully initialized ${result.modifiedCount} users`,
      updatedCount: result.modifiedCount,
      totalNonAdminUsers: users.length,
      users: users.map(user => ({
        email: user.email,
        name: user.name,
        canTakeQuizzes: user.canTakeQuizzes
      }))
    })
  } catch (error) {
    console.error("Error initializing users:", error)
    if (error instanceof Response) {
      return error
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}