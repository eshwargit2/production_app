import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      console.log("Avatar update failed: No token found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!JWT_SECRET) {
      console.error("Avatar update failed: JWT_SECRET not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string }
    const { avatarId } = await req.json()

    console.log("Avatar update request:", { userId: decoded.sub, avatarId })

    if (!avatarId || typeof avatarId !== "number" || avatarId < 1 || avatarId > 12) {
      console.log("Avatar update failed: Invalid avatar ID", avatarId)
      return NextResponse.json({ error: "Invalid avatar ID" }, { status: 400 })
    }

    await dbConnect()
    
    const user = await User.findByIdAndUpdate(
      decoded.sub,
      { avatarId },
      { new: true, select: "-passwordHash" }
    )

    if (!user) {
      console.log("Avatar update failed: User not found", decoded.sub)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Avatar update successful:", { userId: user._id, newAvatarId: avatarId })

    return NextResponse.json({
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        avatarId: user.avatarId
      }
    })
  } catch (error) {
    console.error("Avatar update error:", error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
