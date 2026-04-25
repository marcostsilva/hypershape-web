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

  const organizationId = (session.user as any).organizationId as string | null
  if (!organizationId) redirect(`/${gymSlug}/dashboard`)

  const memberships = await prisma.membership.findMany({
    where: { organizationId },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { joinedAt: "desc" },
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
            <p className="text-zinc-500 text-sm">{memberships.length} aluno{memberships.length !== 1 ? "s" : ""} cadastrado{memberships.length !== 1 ? "s" : ""}</p>
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
      {memberships.length === 0 ? (
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
          {memberships.map((membership) => (
            <div
              key={membership.id}
              className="group relative flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:border-primary/40 hover:bg-white/8 transition-all backdrop-blur-xl"
            >
              <Link 
                href={`/${gymSlug}/admin/students/${membership.userId}`}
                className="absolute inset-0 z-0"
              />
              
              {/* Avatar */}
              <div className="relative z-10 h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-semibold text-lg flex-shrink-0">
                {membership.user.name?.charAt(0).toUpperCase() ?? "?"}
              </div>

              <div className="relative z-10 flex-1 min-w-0">
                <p className="font-medium text-white truncate">{membership.user.name ?? "Sem nome"}</p>
                <p className="text-zinc-500 text-sm truncate">{membership.user.email}</p>
              </div>

              <div className="relative z-10 text-[10px] uppercase font-bold tracking-widest text-zinc-400 bg-white/5 px-2 py-1 rounded border border-white/5 flex-shrink-0">
                {membership.role}
              </div>

              <div className="relative z-10 flex items-center gap-2">
                <StudentActions studentId={membership.userId} studentName={membership.user.name || ""} />
                <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-primary transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
