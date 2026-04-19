import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboardRoot = req.nextUrl.pathname === "/dashboard" || req.nextUrl.pathname === "/dashboard/"
  const isOnDashboard = req.nextUrl.pathname.includes("/dashboard")
  const isOnAuthPath = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register"

  if (isOnDashboardRoot && isLoggedIn) {
    return NextResponse.redirect(new URL("/me/dashboard", req.nextUrl))
  }

  if (isOnDashboard) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
    return NextResponse.next()
  }

  if (isOnAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/me/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
