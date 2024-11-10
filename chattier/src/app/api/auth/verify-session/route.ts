import { auth } from "@/firebase/admin"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

/**
 * Handles GET requests to validate the session cookie.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - A response indicating whether the session cookie is valid.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const cookieStore = cookies()
  const sessionCookie = cookieStore.get("session")?.value

  if (!sessionCookie) {
    return NextResponse.json({ isValid: false }, { status: 401 })
  }

  try {
    await auth.verifySessionCookie(sessionCookie, true)
    return NextResponse.json({ isValid: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ isValid: false }, { status: 401 })
  }
}
