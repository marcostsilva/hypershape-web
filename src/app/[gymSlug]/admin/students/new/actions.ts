"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createStudentAction(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const gymSlug = formData.get("gymSlug") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string

  if (!name || !email) {
    redirect(`/${gymSlug}/admin/students/new?error=${encodeURIComponent("Nome e e-mail são obrigatórios.")}`)
  }

  const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
  if (!gym) redirect(`/${gymSlug}/admin/students/new?error=${encodeURIComponent("Academia não encontrada.")}`)

  // Validar capacidade do plano
  try {
    const { validateGymCapacity } = await import("@/lib/services/gym")
    await validateGymCapacity(gym.id)
  } catch (error: any) {
    redirect(`/${gymSlug}/admin/students/new?error=${encodeURIComponent(error.message)}`)
  }

  // Verificar se o e-mail já existe
  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    if (existingUser.gymId === gym!.id) {
      redirect(`/${gymSlug}/admin/students/new?error=${encodeURIComponent("Este aluno já está cadastrado nesta academia.")}`)
    } else if (existingUser.gymId) {
      redirect(`/${gymSlug}/admin/students/new?error=${encodeURIComponent("Este e-mail já está vinculado a outra academia.")}`)
    } else {
      // Usuário existe mas não tem academia (INDEPENDENT/SELF). Vincula à academia.
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          gymId: gym!.id,
          role: "MEMBER",
          joinedGymAt: new Date(),
        }
      })
    }
  } else {
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        gymId: gym!.id,
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

    const activationLink = `http://localhost:3000/reset-password?token=${token}`
    
    // 1. Log local (backup)
    try {
      const fs = require('fs')
      const path = require('path')
      const logPath = path.join(process.cwd(), 'reset-links.log')
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] ATIVAÇÃO ALUNO: ${name} (${email}) | Link: ${activationLink}\n`)
    } catch (e) {}

    // 2. Envio Real via Resend
    const { sendPasswordResetEmail } = await import("@/lib/mail")
    await sendPasswordResetEmail(email, token, name)
  }

  const basePath = `/${gymSlug}/admin/students`
  revalidatePath(basePath)
  redirect(basePath)
}
