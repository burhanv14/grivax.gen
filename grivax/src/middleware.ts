import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
)

// Protect all routes that require authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/courses/:path*",
    "/assessments/:path*",
    "/account/:path*",
    "/billing/:path*",
    "/notifications/:path*",
  ],
} 