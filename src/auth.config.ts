import type { NextAuthConfig } from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Mock Login (Dev)",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "teste@exemplo.com" },
        password: { label: "Senha (Qualquer)", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        // Na versão Edge, não podemos bater no Prisma diretamente.
        // O login mock real precisará ser feito no servidor.
        // Por ora, vamos retornar um usuário "fictício" para passar pelo middleware,
        // ou você pode deixar o authorize vazio no edge e implementá-lo no auth.ts.
        return {
          id: "dev-mock-id",
          email: credentials.email as string,
          name: "Usuário Teste"
        }
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.image = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.image = (token.image as string) || null
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  }
} satisfies NextAuthConfig
