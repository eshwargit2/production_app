import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"
import { signJwt } from "@/lib/auth"

export async function POST(req: Request) {
  await dbConnect()
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  const user = await User.findOne({ email })
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  const token = signJwt({ sub: String(user._id), email: user.email, name: user.name, isAdmin: user.isAdmin })
  const res = NextResponse.json({ user: { email: user.email, name: user.name, isAdmin: user.isAdmin } })
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookies.set("token", token, { 
    httpOnly: true, 
    sameSite: "lax", 
    secure: isProduction, // Only secure in production (HTTPS)
    path: "/" 
  })
  return res
}
