import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"

export const { auth: middleware } = NextAuth(authConfig)

export default middleware((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith('/dashboard')
  
  if (isOnDashboard) {
    if (!isLoggedIn) {
      return Response.redirect(new URL('/api/auth/signin', req.nextUrl))
    }
  }

  // Futuro: Lógica de subdomínio/tenant aqui usando req.headers.get("host") ou pathname
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
