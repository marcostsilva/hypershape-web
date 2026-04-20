"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { Prisma } from "@prisma/client"
import { z } from "zod"

const studentSchema = z.object({
  gymSlug: z.string(),
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
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
    const session = await auth()
    if (!session?.user) throw new Error("Não autorizado")

    const validated = studentSchema.parse(data)
    const { gymSlug, name, email } = validated

    const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
    if (!gym) throw new Error("Academia não encontrada.")

    // Validar capacidade do plano
    const { validateGymCapacity } = await import("@/lib/services/gym")
    await validateGymCapacity(gym.id)

    // Verificar se o e-mail já existe
    const existingUser = await prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      if (existingUser.gymId === gym.id) {
        return { error: "Este aluno já está cadastrado nesta academia." }
      } else if (existingUser.gymId) {
        return { error: "Este e-mail já está vinculado a outra academia." }
      } else {
        // Usuário existe mas não tem academia (INDEPENDENT/SELF). Vincula à academia.
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            gymId: gym.id,
            role: "MEMBER",
            joinedGymAt: new Date(),
          }
        })
      }
    } else {
      await prisma.user.create({
        data: {
          name,
          email,
          gymId: gym.id,
          role: "MEMBER",
          joinedGymAt: new Date(),
        }
      })

      // Gerar link de "ativação" (que na verdade é um reset de senha)
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
        // Não falha o cadastro se o e-mail falhar, mas avisa?
        // Por enquanto vamos deixar passar.
      }
    }

    revalidatePath(`/${gymSlug}/admin/students`)
    return { success: true }
  } catch (error: any) {
    console.error("Error creating student:", error)
    return { error: handlePrismaError(error) }
  }
}
