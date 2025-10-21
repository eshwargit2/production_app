import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"

export async function POST(req: Request) {
  try {
    await dbConnect()
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ isAdmin: true })
    if (existingAdmin) {
      return NextResponse.json({ 
        message: "Admin user already exists", 
        email: existingAdmin.email 
      })
    }
    
    // Create admin user
    const passwordHash = await bcrypt.hash("admin123", 10)
    const adminUser = await User.create({
      email: "admin@example.com",
      passwordHash,
      name: "Admin User",
      isAdmin: true,
      avatarId: 1
    })
    
    return NextResponse.json({ 
      message: "Admin user created successfully",
      email: "admin@example.com",
      password: "admin123"
    })
    
  } catch (error: any) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ 
      error: "Failed to create admin user",
      details: error?.message || "Unknown error"
    }, { status: 500 })
  }
}
