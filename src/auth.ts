import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"
import bcrypt from "bcryptjs"

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    ...authConfig.providers,
    Credentials({
      name: "Email e Senha",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "seu@email.com" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;
        
        const user = await prisma.user.findUnique({ where: { email } })
        
        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          gymId: user.gymId,
          isBlocked: user.isBlocked,
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      // Se tivermos user, é o momento do sign in
      if (user) {
        token.role = (user as any).role
        token.gymId = (user as any).gymId
        token.isBlocked = (user as any).isBlocked
        token.isManaged = (user as any).isManaged
        token.accessStatus = (user as any).accessStatus
      }

      // Sempre tentar buscar o slug se tivermos gymId mas não tivermos slug no token ainda
      if (token.gymId && !token.gymSlug) {
        const gym = await prisma.gym.findUnique({
          where: { id: token.gymId as string },
          select: { slug: true }
        })
        token.gymSlug = gym?.slug
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
        ;(session.user as any).role = token.role
        ;(session.user as any).gymId = token.gymId
        ;(session.user as any).gymSlug = token.gymSlug
        ;(session.user as any).isBlocked = token.isBlocked
        ;(session.user as any).isManaged = token.isManaged
        ;(session.user as any).accessStatus = token.accessStatus
      }
      return session
    }
  }
})
