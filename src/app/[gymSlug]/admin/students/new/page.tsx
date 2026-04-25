import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { BackButton } from "@/components/back-button"
import { StudentForm } from "./student-form"

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
        <BackButton />
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight uppercase">
            Adicionar <span className="text-primary">Aluno</span>
          </h1>
          <p className="text-zinc-500 mt-1 text-sm">
            Cadastre um novo aluno para acesso imediato ao aplicativo.
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
        <StudentForm gymSlug={gymSlug} />
      </div>
    </div>
  )
}
