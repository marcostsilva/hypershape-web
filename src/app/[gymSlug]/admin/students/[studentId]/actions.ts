"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function resendActivationAction(studentId: string, gymSlug: string) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado." }

  const student = await prisma.user.findUnique({
    where: { id: studentId }
  })

  if (!student) return { error: "Aluno não encontrado." }

  // Gerar novo token de "ativação" (que na verdade é um reset de senha)
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  const expires = new Date(Date.now() + (7 * 24 * 3600000)) // 7 dias

  await prisma.passwordResetToken.create({
    data: { email: student.email, token, expires }
  })

  const activationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  // 1. Log local (backup)
  try {
    const fs = require('fs')
    const path = require('path')
    const logPath = path.join(process.cwd(), 'reset-links.log')
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] REENVIO ATIVAÇÃO: ${student.name} (${student.email}) | Link: ${activationLink}\n`)
  } catch (e) {}

  // 2. Envio Real via Resend
  try {
    const { sendPasswordResetEmail } = await import("@/lib/mail")
    await sendPasswordResetEmail(student.email, token, student.name || undefined)
  } catch (e) {
    console.error("Erro no envio via Resend:", e)
  }

  revalidatePath(`/${gymSlug}/admin/students/${studentId}`)
  return { success: "E-mail de ativação reenviado com sucesso!" }
}
