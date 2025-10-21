import jwt from "jsonwebtoken"
import { cookies, headers } from "next/headers"
import type { NextRequest } from "next/server"

function getJwtSecret() {
  return process.env.JWT_SECRET
}

export type JwtPayload = { sub: string; email: string; name: string; isAdmin: boolean }

export function signJwt(payload: JwtPayload, expiresIn = "7d") {
  const secret = getJwtSecret()
  if (!secret) throw new Error("JWT_SECRET is not set. Add it in Project Settings > Environment Variables.")
  return jwt.sign(payload, secret, { expiresIn })
}

export function verifyJwt(token?: string): JwtPayload | null {
  const secret = getJwtSecret()
  try {
    if (!token || !secret) return null
    return jwt.verify(token, secret) as JwtPayload
  } catch {
    return null
  }
}

export function getAuthTokenFromReq(req?: NextRequest): string | undefined {
  // Prefer cookie, fallback to Authorization: Bearer
  try {
    const c = cookies()
    const token = c.get("token")?.value
    if (token) return token
  } catch {}
  const auth = headers().get("authorization")
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length)
  return undefined
}

export function requireUser(): JwtPayload {
  const token = getAuthTokenFromReq()
  const payload = verifyJwt(token)
  if (!payload) throw new Response("Unauthorized", { status: 401 })
  return payload
}

export function requireAdmin(): JwtPayload {
  const payload = requireUser()
  if (!payload.isAdmin) throw new Response("Forbidden", { status: 403 })
  return payload
}
