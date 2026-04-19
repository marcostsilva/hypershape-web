import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import { authConfig } from "./auth.config"

// O auth.ts é usado APENAS no servidor (API routes, Server Actions, Server Components)
// Ele adiciona o PrismaAdapter à configuração base que já tem os providers.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
})
