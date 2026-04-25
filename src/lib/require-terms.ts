import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CURRENT_PRIVACY_VERSION } from "@/lib/constants"

/**
 * Verifica se o usuário logado aceitou a versão atual dos termos de privacidade.
 * Se não aceitou, redireciona para /terms.
 * 
 * Deve ser chamado nos layouts protegidos (dashboard, admin).
 * Roda em Node.js com acesso ao Prisma (não no Edge/middleware).
 */
export async function requireTermsAccepted() {
  const session = await auth()
  if (!session?.user?.id) return // Não logado, outros guards tratam

  // Buscar direto do banco (source of truth)
  let user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { privacyVersion: true }
  })

  // Fallback por email se o id do JWT não bater
  if (!user && session.user.email) {
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { privacyVersion: true }
    })
  }

  if (!user || user.privacyVersion !== CURRENT_PRIVACY_VERSION) {
    redirect("/terms")
  }
}
