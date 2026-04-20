import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { UserPlus, Users, ChevronRight } from "lucide-react"
import { StudentActions } from "./student-actions"

export default async function StudentsPage({
  params,
}: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()

  if (!session?.user) redirect("/login")

  const gymId = (session.user as any).gymId as string | null
  if (!gymId) redirect(`/${gymSlug}/dashboard`)

  const students = await prisma.user.findMany({
    where: { gymId },
    select: { id: true, name: true, email: true, role: true, joinedGymAt: true },
    orderBy: { joinedGymAt: "desc" },
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">Alunos</h1>
            <p className="text-zinc-500 text-sm">{students.length} aluno{students.length !== 1 ? "s" : ""} cadastrado{students.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        <Link
          href={`/${gymSlug}/admin/students/new`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Adicionar Aluno
        </Link>
      </div>

      {/* Students List */}
      {students.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center backdrop-blur-xl">
          <Users className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-white font-medium mb-2">Nenhum aluno cadastrado</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Comece adicionando seus alunos para prescrever treinos.
          </p>
          <Link
            href={`/${gymSlug}/admin/students/new`}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Primeiro Aluno
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {students.map((student) => (
            <div
              key={student.id}
              className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/40 hover:bg-white/8 transition-all backdrop-blur-xl"
            >
              <Link 
                href={`/${gymSlug}/admin/students/${student.id}`}
                className="absolute inset-0 z-0"
              />
              
              {/* Avatar */}
              <div className="relative z-10 h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-lg flex-shrink-0">
                {student.name?.charAt(0).toUpperCase() ?? "?"}
              </div>

              <div className="relative z-10 flex-1 min-w-0">
                <p className="font-medium text-white truncate">{student.name ?? "Sem nome"}</p>
                <p className="text-zinc-500 text-sm truncate">{student.email}</p>
              </div>

              <div className="relative z-10 text-[10px] uppercase font-bold tracking-widest text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5 flex-shrink-0">
                {student.role}
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <StudentActions studentId={student.id} studentName={student.name || ""} />
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
