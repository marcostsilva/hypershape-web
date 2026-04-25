import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Dumbbell, ArrowRight } from "lucide-react"
import { RegisterForm } from "@/components/auth/register-form"

export default async function RegisterPage() {
  const session = await auth()
  
  if (session?.user) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Background decorativo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-50" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30">
            <Dumbbell className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Criar Conta</h1>
          <p className="text-zinc-400 mt-2 text-center text-sm">
            Junte-se ao HyperShape e comece a acompanhar seus treinos.
          </p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
          <RegisterForm />

          <div className="mt-6 text-center text-sm text-zinc-500">
            Já tem uma conta?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Fazer Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
