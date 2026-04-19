"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerAction(prevState: any, formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password || password.length < 6) {
    return { error: "Dados inválidos. A senha deve ter pelo menos 6 caracteres." }
  }

  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return { error: "E-mail já cadastrado." }
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10)

  try {
    // Cria o usuário
    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })
  } catch (error) {
    return { error: "Erro ao criar conta. Tente novamente mais tarde." }
  }

  // Redireciona para o login com mensagem de sucesso
  redirect("/login?success=registered")
}
