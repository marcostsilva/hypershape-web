"use server"

import prisma from "@/lib/prisma"
import { crypto } from "next/dist/compiled/@edge-runtime/primitives"

export async function requestPasswordResetAction(formData: FormData) {
  const email = formData.get("email") as string

  if (!email) {
    return { error: "E-mail é obrigatório." }
  }

  // Por segurança, sempre dizemos que enviamos o link, mesmo se o e-mail não existir
  // Mas internamente, só criamos o token se o usuário existir
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (user) {
    // Gerar um token aleatório (mockando o envio por email)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    const expires = new Date(Date.now() + 3600000) // 1 hora

    await prisma.passwordResetToken.create({
      data: { email, token, expires }
    })

    const resetLink = `http://localhost:3000/reset-password?token=${token}`
    console.log(`[MOCK EMAIL] Link de reset para ${email}: ${resetLink}`)
    
    // 1. Log local (backup)
    try {
      const fs = require('fs')
      const path = require('path')
      const logPath = path.join(process.cwd(), 'reset-links.log')
      fs.appendFileSync(logPath, `[${new Date().toISOString()}] Email: ${email} | Link: ${resetLink}\n`)
    } catch (e) {}

    // 2. Envio Real via Resend
    const { sendPasswordResetEmail } = await import("@/lib/mail")
    await sendPasswordResetEmail(email, token, user.name || undefined)
  }

  return { success: "Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha em instantes." }
}
