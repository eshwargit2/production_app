import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { dbConnect } from "@/lib/mongodb"
import User from "@/models/user"
import { signJwt } from "@/lib/auth"

export async function POST(req: Request) {
  await dbConnect()
  const { email, password, name, isAdmin } = await req.json()
  if (!email || !password || !name) return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  const existing = await User.findOne({ email })
  if (existing) return NextResponse.json({ error: "Email in use" }, { status: 409 })
  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, name, isAdmin: !!isAdmin })
  const token = signJwt({ sub: String(user._id), email, name, isAdmin: !!isAdmin })
  const res = NextResponse.json({ user: { email, name, isAdmin: !!isAdmin } })
  const isProduction = process.env.NODE_ENV === 'production'
  res.cookies.set("token", token, { 
    httpOnly: true, 
    sameSite: "lax", 
    secure: isProduction, // Only secure in production (HTTPS)
    path: "/" 
  })
  return res
}
