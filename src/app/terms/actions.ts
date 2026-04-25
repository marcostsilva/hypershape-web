"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { audit, AuditAction } from "@/lib/services/audit"
import { redirect } from "next/navigation"
import { CURRENT_PRIVACY_VERSION } from "@/lib/constants"

export async function acceptTermsAction() {
  const session = await auth()
  console.log("[acceptTerms] session.user:", JSON.stringify({ id: session?.user?.id, email: session?.user?.email }))
  if (!session?.user?.id) {
    console.log("[acceptTerms] No user id in session, returning error")
    return { error: "Não autorizado" }
  }

  // Verificar se o usuário existe antes de atualizar
  const existingUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true }
  })

  if (!existingUser) {
    // Fallback: tentar por email (caso o id do JWT esteja desatualizado)
    if (session.user.email) {
      const userByEmail = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true }
      })

      if (userByEmail) {
        await prisma.user.update({
          where: { id: userByEmail.id },
          data: {
            acceptedTermsAt: new Date(),
            privacyVersion: CURRENT_PRIVACY_VERSION,
          }
        })

        await audit(userByEmail.id, AuditAction.USER_TERMS_ACCEPT, {
          metadata: { version: CURRENT_PRIVACY_VERSION }
        })

        const user = session.user as any
        if (user.gymSlug) {
          redirect(`/${user.gymSlug}/dashboard`)
        }
        redirect("/")
      }
    }
    return { error: "Usuário não encontrado. Faça login novamente." }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      acceptedTermsAt: new Date(),
      privacyVersion: CURRENT_PRIVACY_VERSION,
    }
  })

  await audit(session.user.id, AuditAction.USER_TERMS_ACCEPT, {
    metadata: { version: CURRENT_PRIVACY_VERSION }
  })

  // Redireciona para onde o usuário deveria estar
  const user = session.user as any
  if (user.gymSlug) {
    redirect(`/${user.gymSlug}/dashboard`)
  }
  redirect("/")
}
