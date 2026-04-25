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

  // 2. LGPD — Consentimento verificado nos layouts protegidos (Node.js + Prisma)
  // O middleware roda no Edge sem acesso ao banco de dados.

  // 3. Dashboard Root Redirect
  if (isOnDashboardRoot && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  // 4. Admin & Tenant Protection
  const pathParts = path.split("/")
  const gymSlugFromUrl = pathParts[1]
  
  // Se estiver em uma rota de academia (ex: /gold-gym/admin ou /gold-gym/dashboard)
  const isGymPath = gymSlugFromUrl && !["admin", "login", "register", "api", "blocked", "me", "terms", "forgot-password", "reset-password"].includes(gymSlugFromUrl)

  if (isGymPath) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }

    // Se o usuário não for SUPER_ADMIN e estiver tentando acessar uma academia que não é a dele
    const isSuperAdmin = (user.role === "ADMIN" || user.role === "COACH") && !user.organizationId
    
    if (!isSuperAdmin && user.gymSlug !== gymSlugFromUrl) {
      // Redireciona para a academia correta do usuário se ele tiver uma
      if (user.gymSlug) {
        return NextResponse.redirect(new URL(`/${user.gymSlug}${isOnDashboard ? "/dashboard" : "/admin"}`, req.nextUrl))
      }
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  // 5. Global Admin Protection (/admin)
  if (path.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", req.nextUrl))
    }
    
    const isSuperAdmin = (user.role === "ADMIN" || user.role === "COACH") && !user.organizationId
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/", req.nextUrl))
    }
  }

  // 6. Auth Path Redirect
  if (isOnAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL("/", req.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
