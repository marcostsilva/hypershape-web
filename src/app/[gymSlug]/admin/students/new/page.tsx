import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus } from "lucide-react"
import { createStudentAction } from "./actions"

export default async function NewStudentPage({
  params,
}: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/${gymSlug}/admin/students`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
            Adicionar Aluno
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Cadastre um novo aluno usando apenas nome e e-mail.
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-xl">
        <form action={createStudentAction} className="space-y-6">
          <input type="hidden" name="gymSlug" value={gymSlug} />
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-zinc-300">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: João da Silva"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              placeholder="Ex: joao@email.com"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
            <p className="text-xs text-zinc-500 mt-2">
              O aluno usará este e-mail para fazer login no aplicativo.
            </p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <UserPlus className="h-5 w-5" />
              Cadastrar Aluno
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
