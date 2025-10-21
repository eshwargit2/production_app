import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const adminUser = requireAdmin()
    
    return NextResponse.json({
      success: true,
      admin: {
        id: adminUser.sub,
        email: adminUser.email,
        name: adminUser.name,
        isAdmin: adminUser.isAdmin
      },
      message: "Admin authentication successful"
    })
  } catch (error) {
    console.error("Admin auth test failed:", error)
    
    if (error instanceof Response) {
      const errorText = await error.text()
      return NextResponse.json({ 
        success: false, 
        error: errorText,
        status: error.status 
      }, { status: error.status })
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Unknown error" 
    }, { status: 500 })
  }
}