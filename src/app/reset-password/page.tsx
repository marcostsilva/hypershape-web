import { redirect } from "next/navigation"
import { ResetPasswordForm } from "./reset-password-form"
import prisma from "@/lib/prisma"

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const searchParams = await props.searchParams
  const token = searchParams.token

  if (!token) {
    redirect("/login")
  }

  // Verificar se o token é válido antes de mostrar o form
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token }
  })

  if (!resetToken || resetToken.expires < new Date()) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-2xl backdrop-blur-md">
            <h1 className="text-2xl font-bold text-white mb-2">Link Expirado</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Este link de recuperação de senha não é mais válido ou já foi utilizado.
            </p>
            <a 
              href="/login" 
              className="inline-block bg-primary text-black font-bold px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
            >
              Voltar para Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}
