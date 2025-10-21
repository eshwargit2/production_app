import { NextResponse } from "next/server"
import { verifyJwt, getAuthTokenFromReq } from "@/lib/auth"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"

export async function GET() {
  try {
    const payload = verifyJwt(getAuthTokenFromReq())
    if (!payload) return NextResponse.json({ user: null })
    
    await dbConnect()
    const user = await User.findOne({ email: payload.email }).select("-passwordHash")
    
    if (!user) {
      return NextResponse.json({ user: null })
    }
    
    return NextResponse.json({ 
      user: { 
        _id: user._id.toString(),
        email: user.email, 
        name: user.name, 
        isAdmin: user.isAdmin,
        avatarId: user.avatarId || 1,
        canTakeQuizzes: user.canTakeQuizzes || false
      } 
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ user: null })
  }
}
