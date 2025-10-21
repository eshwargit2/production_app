import { NextRequest, NextResponse } from "next/server"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    console.log("🔍 GET /api/admin/users - Starting request")
    
    requireAdmin()
    await dbConnect()
    
    console.log("✅ Admin verification and DB connection successful")
    
    const users = await User.find({ isAdmin: false })
      .select("email name avatarId createdAt")
      .sort({ createdAt: -1 })
    
    console.log(`📋 Found ${users.length} non-admin users`)
    
    const responseData = {
      users: users.map(user => ({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarId: user.avatarId,
        createdAt: user.createdAt
      }))
    }
    
    console.log("📤 Sending response with users:", responseData.users.map(u => ({ email: u.email })))
    
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching users:", error)
    if (error instanceof Response) {
      return error
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}