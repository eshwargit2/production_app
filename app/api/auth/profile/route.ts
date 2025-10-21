import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"

const JWT_SECRET = process.env.JWT_SECRET!

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = cookies()
    const token = cookieStore.get("token")?.value

    if (!token) {
      console.log("Profile update failed: No token found")
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!JWT_SECRET) {
      console.error("Profile update failed: JWT_SECRET not configured")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string }
    const { name } = await req.json()

    console.log("Profile update request:", { 
      userId: decoded.sub, 
      name
    })

    // Validate input
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      console.log("Profile update failed: Invalid name")
      return NextResponse.json({ error: "Name is required and cannot be empty" }, { status: 400 })
    }

    if (name.trim().length > 100) {
      console.log("Profile update failed: Name too long")
      return NextResponse.json({ error: "Name cannot be longer than 100 characters" }, { status: 400 })
    }

    await dbConnect()
    
    const updateData = { name: name.trim() }
    
    console.log("About to update user with data:", { 
      userId: decoded.sub, 
      updateFields: Object.keys(updateData)
    })
    
    const user = await User.findByIdAndUpdate(
      decoded.sub,
      updateData,
      { new: true, select: "-passwordHash" }
    )

    if (!user) {
      console.log("Profile update failed: User not found", decoded.sub)
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log("Profile update successful:", { 
      userId: user._id, 
      newName: user.name
    })

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
    console.error("Profile update error:", error)
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}