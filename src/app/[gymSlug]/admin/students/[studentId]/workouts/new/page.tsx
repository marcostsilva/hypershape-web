import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { createStudentWorkoutAction } from "./actions"
import prisma from "@/lib/prisma"

export default async function NewStudentWorkoutPage({
  params,
}: {
  params: Promise<{ gymSlug: string; studentId: string }>
}) {
  const { gymSlug, studentId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const student = await prisma.user.findUnique({ where: { id: studentId } })
  if (!student) redirect(`/${gymSlug}/admin/students`)

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/${gymSlug}/admin/students/${studentId}`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
            Prescrever Treino
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            Para {student.name}
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8 backdrop-blur-xl">
        <form action={createStudentWorkoutAction} className="space-y-6">
          <input type="hidden" name="gymSlug" value={gymSlug} />
          <input type="hidden" name="studentId" value={studentId} />
          
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-zinc-300">
              Nome do Treino
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              placeholder="Ex: Treino A - Peito e Tríceps"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              Continuar para Seleção de Exercícios
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
