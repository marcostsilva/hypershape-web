import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboardRoot = req.nextUrl.pathname === "/dashboard" || req.nextUrl.pathname === "/dashboard/"
  const isOnDashboard = req.nextUrl.pathname.includes("/dashboard")
  const isOnAuthPath = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register"

  const user = req.auth?.user as any
  const path = req.nextUrl.pathname

  // 1. Bloqueio Global
  if (isLoggedIn && user?.isBlocked) {
    if (path !== "/blocked") {
      return NextResponse.redirect(new URL("/blocked", req.nextUrl))
    }
    return NextResponse.next()
  }

  // 2. Dashboard Root Redirect
  if (isOnDashboardRoot && isLoggedIn) {
    return NextResponse.redirect(new URL("/me/dashboard", req.nextUrl))
  }

  // 3. Admin Protection
  if (path.includes("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
    
    const isSuperAdmin = (user.role === "ADMIN" || user.role === "COACH") && !user.gymId
    const isGymAdmin = (user.role === "ADMIN" || user.role === "COACH") && !!user.gymId

    // Se tentar acessar /admin (global) mas não for super admin
    if (path.startsWith("/admin") && !isSuperAdmin) {
      return NextResponse.redirect(new URL("/me/dashboard", req.nextUrl))
    }

    // Se tentar acessar /[slug]/admin mas não for admin dessa academia (ou super admin)
    // Nota: A lógica de permissão por slug específico pode ser refinada aqui se necessário.
    if (!isSuperAdmin && !isGymAdmin) {
      return NextResponse.redirect(new URL("/me/dashboard", req.nextUrl))
    }
  }

  // 4. Dashboard Protection
  if (isOnDashboard) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
    return NextResponse.next()
  }

  // 5. Auth Path Redirect
  if (isOnAuthPath && isLoggedIn) {
    if (user.role === "ADMIN" || user.role === "COACH") {
      if (!user.gymId) return NextResponse.redirect(new URL("/admin", req.nextUrl))
      if (user.gymSlug) return NextResponse.redirect(new URL(`/${user.gymSlug}/admin`, req.nextUrl))
    }
    return NextResponse.redirect(new URL("/me/dashboard", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
