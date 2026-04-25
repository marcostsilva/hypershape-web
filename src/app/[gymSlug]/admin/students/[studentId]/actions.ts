"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { requireCoachOrAdmin, AuthError } from "@/lib/auth-guard"

export async function resendActivationAction(studentId: string, gymSlug: string) {
  try {
    // Auth Guard: somente Coach/Admin da organização
    const ctx = await requireCoachOrAdmin(gymSlug)

    // Anti-IDOR: verificar que o aluno pertence a esta organização
    const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
    if (!gym) return { error: "Academia não encontrada." }

    const membership = await prisma.membership.findFirst({
      where: { userId: studentId, organizationId: gym.id }
    })
    if (!membership) return { error: "Aluno não pertence a esta academia." }

    const student = await prisma.user.findUnique({
      where: { id: studentId }
    })
    if (!student) return { error: "Aluno não encontrado." }

    // Gerar novo token de "ativação" (reset de senha)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expires = new Date(Date.now() + (7 * 24 * 3600000)) // 7 dias

    await prisma.passwordResetToken.create({
      data: { email: student.email, token, expires }
    })

    // Envio Real via Resend
    try {
      const { sendPasswordResetEmail } = await import("@/lib/mail")
      await sendPasswordResetEmail(student.email, token, student.name || undefined)
    } catch (e) {
      console.error("Erro no envio via Resend:", e)
    }

    revalidatePath(`/${gymSlug}/admin/students/${studentId}`)
    return { success: "E-mail de ativação reenviado com sucesso!" }
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error resending activation:", error)
    return { error: "Erro ao reenviar ativação." }
  }
}
