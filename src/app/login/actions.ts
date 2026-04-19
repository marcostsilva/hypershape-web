"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function loginWithCredentialsAction(
  prevState: any,
  formData: FormData
) {
  try {
    formData.append("redirectTo", "/me/dashboard")
    await signIn("credentials", formData)
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Usuário ou senha inválida." }
        default:
          return { error: "Ocorreu um erro inesperado." }
      }
    }
    throw error
  }
}

export async function loginWithGoogleAction() {
  await signIn("google", { redirectTo: "/me/dashboard" })
}
