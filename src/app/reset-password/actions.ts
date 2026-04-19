"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const token = formData.get("token") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (!token) return { error: "Token inválido ou ausente." }
  if (!password || password.length < 6) return { error: "A senha deve ter pelo menos 6 caracteres." }
  if (password !== confirmPassword) return { error: "As senhas não coincidem." }

  // Buscar o token no banco
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return { error: "Este link de recuperação expirou ou é inválido." }
  }

  // Criptografar a nova senha
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Atualizar a senha do usuário e deletar o token em uma transação
    await prisma.$transaction([
      prisma.user.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword }
      }),
      prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
    ])
  } catch (error) {
    return { error: "Erro ao atualizar a senha. Tente novamente." }
  }

  // Redirecionar para o login com mensagem de sucesso
  redirect("/login?success=password_reset")
}
