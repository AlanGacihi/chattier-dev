import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * A middleware function that verifies the user's session cookie.
 *
 * @param {NextRequest} request - The incoming request object.
 * @returns {Promise<NextResponse>} - A response indicating whether the session cookie is valid.
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const session = request.cookies.get("session")

  if (!session) {
    // If there's no session cookie, redirect to login
    const loginUrl = new URL("/sign-in", request.url)
    loginUrl.searchParams.set("origin", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify the session by calling our API route
  const verifyUrl = new URL("/api/auth/verify-session", request.url)
  const verifyRes = await fetch(verifyUrl, {
    headers: {
      Cookie: `session=${session.value}`,
    },
  })

  if (!verifyRes.ok) {
    // If verification fails, redirect to login
    const loginUrl = new URL("/sign-in", request.url)
    loginUrl.searchParams.set("origin", request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If verification succeeds, allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*"],
}
