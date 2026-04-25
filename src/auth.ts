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
        
        const user = await prisma.user.findUnique({ 
          where: { email },
          include: {
            memberships: {
              include: {
                organization: {
                  select: { slug: true }
                }
              }
            }
          }
        })
        
        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return null;
        }
        
        // Pega a primeira academia vinculada como padrão (ou nenhuma se for super admin)
        const primaryMembership = user.memberships[0];
        
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.globalRole === 'SUPER_ADMIN' ? 'ADMIN' : (primaryMembership?.role || 'SELF'),
          organizationId: user.globalRole === 'SUPER_ADMIN' ? null : primaryMembership?.organizationId,
          gymSlug: user.globalRole === 'SUPER_ADMIN' ? null : primaryMembership?.organization?.slug,
          isBlocked: user.isBlocked,
          privacyVersion: user.privacyVersion,
        }
      }
    })
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role
        token.organizationId = (user as any).organizationId
        token.gymSlug = (user as any).gymSlug
        token.isBlocked = (user as any).isBlocked
        token.privacyVersion = (user as any).privacyVersion
      }

      // Se houver mudança de tenant ou termos via sessão, atualizar token
      if (trigger === "update" && session) {
        if (session.organizationId !== undefined) {
          token.organizationId = session.organizationId
          token.gymSlug = session.gymSlug
          token.role = session.role
        }
        if (session.privacyVersion !== undefined) {
          token.privacyVersion = session.privacyVersion
        }
      }

      // Corrigir token.sub se o id do JWT não corresponder a um user real (OAuth/mock)
      if (token.sub && token.email) {
        const userById = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { id: true }
        })
        if (!userById) {
          const userByEmail = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true }
          })
          if (userByEmail) {
            token.sub = userByEmail.id
          }
        }
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.sub as string
        ;(session.user as any).role = token.role
        ;(session.user as any).organizationId = token.organizationId
        ;(session.user as any).gymSlug = token.gymSlug
        ;(session.user as any).isBlocked = token.isBlocked
        ;(session.user as any).privacyVersion = token.privacyVersion
      }
      return session
    }
  }
})
