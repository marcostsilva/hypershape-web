import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.organizationId = (user as any).organizationId
        token.gymSlug = (user as any).gymSlug
        token.isBlocked = (user as any).isBlocked
        token.privacyVersion = (user as any).privacyVersion
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).role = token.role
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).gymSlug = token.gymSlug
        ;(session.user as any).isBlocked = token.isBlocked
        ;(session.user as any).privacyVersion = token.privacyVersion
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  }
} satisfies NextAuthConfig
