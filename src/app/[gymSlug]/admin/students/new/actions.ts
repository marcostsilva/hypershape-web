"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { sanitizeString } from "@/lib/sanitize"
import { requireCoachOrAdmin, AuthError } from "@/lib/auth-guard"
import { audit, AuditAction } from "@/lib/services/audit"

const studentSchema = z.object({
  gymSlug: z.string(),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").transform(sanitizeString),
  email: z.string().email("E-mail inválido"),
})

function handlePrismaError(error: any) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return "Este e-mail já está cadastrado no sistema."
    }
  }
  return error.message || "Erro inesperado ao salvar o aluno."
}

export async function createStudentAction(data: z.infer<typeof studentSchema>) {
  try {
    const validated = studentSchema.parse(data)
    const { gymSlug, name, email } = validated

    // Auth Guard: verifica membership real no banco
    const ctx = await requireCoachOrAdmin(gymSlug)

    const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
    if (!gym) throw new Error("Academia não encontrada.")

    // Validar capacidade do plano
    const { validateGymCapacity } = await import("@/lib/services/gym")
    await validateGymCapacity(gym.id)

    // Verificar se o e-mail já existe
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // Criar usuário se não existir
      user = await prisma.user.create({
        data: {
          name,
          email,
          globalRole: 'USER'
        }
      })

      // Gerar link de "ativação" (reset de senha)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expires = new Date(Date.now() + (7 * 24 * 3600000)) // 7 dias

      await prisma.passwordResetToken.create({
        data: { email, token, expires }
      })

      // Envio Real via Resend
      try {
        const { sendPasswordResetEmail } = await import("@/lib/mail")
        await sendPasswordResetEmail(email, token, name)
      } catch (mailError) {
        console.error("Erro ao enviar e-mail de ativação:", mailError)
      }
    }

    // Verificar se já tem membership nesta academia
    const existingMembership = await prisma.membership.findFirst({
      where: {
        userId: user.id,
        organizationId: gym.id
      }
    })

    if (existingMembership) {
      return { error: "Este aluno já está vinculado a esta academia." }
    }

    // Criar o membership
    const membership = await prisma.membership.create({
      data: {
        userId: user.id,
        organizationId: gym.id,
        role: "MEMBER",
        status: "ACTIVE",
        joinedAt: new Date()
      }
    })

    // Audit log
    await audit(ctx.userId, AuditAction.STUDENT_CREATE, {
      organizationId: gym.id,
      targetType: "User",
      targetId: user.id,
      metadata: { studentName: name, studentEmail: email, membershipId: membership.id }
    })

    revalidatePath(`/${gymSlug}/admin/students`)
    return { success: true }
  } catch (error: any) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error creating student:", error)
    return { error: handlePrismaError(error) }
  }
}
