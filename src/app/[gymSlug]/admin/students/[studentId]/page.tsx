import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Dumbbell } from "lucide-react"
import { BackButton } from "@/components/back-button"
import { ResendActivationButton } from "@/components/admin/resend-activation-button"

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ gymSlug: string; studentId: string }>
}) {
  const { gymSlug, studentId } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
  if (!gym) redirect("/me/dashboard")

  // Buscar o membership deste aluno nesta academia específica
  const membership = await prisma.membership.findFirst({
    where: { 
      userId: studentId,
      organizationId: gym.id
    },
    include: {
      user: true
    }
  })

  if (!membership) {
    redirect(`/${gymSlug}/admin/students`)
  }

  const student = membership.user

  // Buscar os treinos planejado (templates) pelo personal para este aluno
  const plannedWorkouts = await prisma.workout.findMany({
    where: {
      userId: student.id,
      organizationId: gym.id,
      isTemplate: true,
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <BackButton />
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-heading font-bold text-white tracking-tight">
              {student.name}
            </h1>
            <p className="text-zinc-400 mt-1 text-sm">
              {student.email}
            </p>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Link
              href={`/${gymSlug}/admin/students/${student.id}/workouts/new`}
              className="bg-primary text-black hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-bold transition-colors flex items-center gap-2"
            >
              <Dumbbell className="h-4 w-4" />
              Prescrever Treino
            </Link>
            
            <ResendActivationButton 
              studentId={student.id} 
              gymSlug={gymSlug} 
              hasPassword={!!student.password}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Treinos Planejados */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium text-white mb-4">Treinos Prescritos</h2>
          {plannedWorkouts.length === 0 ? (
            <p className="text-zinc-500 text-sm">Nenhum treino prescrito para este aluno ainda.</p>
          ) : (
            <div className="space-y-3">
              {plannedWorkouts.map(workout => (
                <Link 
                  key={workout.id} 
                  href={`/${gymSlug}/admin/students/${student.id}/workouts/${workout.id}`}
                  className="block p-4 rounded-lg bg-black/40 border border-white/5 hover:border-primary/50 transition-colors"
                >
                  <h3 className="font-medium text-white">{workout.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">
                    {(workout.exercises as any)?.length || 0} exercícios
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Visão Geral (Resumo do Dashboard do aluno) */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl">
          <h2 className="text-lg font-medium text-white mb-4">Métricas do Aluno</h2>
          <p className="text-zinc-500 text-sm">
            Aqui você poderá ver os gráficos de evolução, volume de treino e frequência deste aluno (em breve).
          </p>
        </div>
      </div>
    </div>
  )
}
