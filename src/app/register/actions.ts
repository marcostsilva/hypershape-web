"use server"

import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"

export async function registerAction(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password || password.length < 6) {
    // Em um app real, lidar com erros (redirecionar com flash message ou useFormState)
    return redirect("/register?error=invalid_data")
  }

  // Verifica se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    return redirect("/register?error=email_exists")
  }

  // Criptografa a senha
  const hashedPassword = await bcrypt.hash(password, 10)

  // Cria o usuário
  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    }
  })

  // Redireciona para o login com mensagem de sucesso
  redirect("/login?success=registered")
}
