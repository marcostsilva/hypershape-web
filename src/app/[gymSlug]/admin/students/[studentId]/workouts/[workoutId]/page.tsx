import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ExerciseSelector } from "@/app/[gymSlug]/dashboard/workouts/[workoutId]/exercise-selector"
import { fetchWorkoutApiExercises } from "@/lib/workout-api"
import exerciseCatalogStatic from "@/lib/exercise-data"

interface WorkoutExercise {
  id: string
  name: string
  category: string
  sets: number
  reps: string
  weight?: number
  notes?: string
}

export default async function AdminWorkoutEditPage({ 
  params 
}: { 
  params: Promise<{ gymSlug: string; studentId: string; workoutId: string }> 
}) {
  const { gymSlug, studentId, workoutId } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId }
  })

  // Permite acesso se for o dono ou se for o coach que criou
  if (!workout || (workout.userId !== studentId && workout.createdById !== session.user.id)) {
    redirect(`/${gymSlug}/admin/students/${studentId}`)
  }

  const existingExercises = (workout.exercises as WorkoutExercise[] | null) || []
  
  // Tenta buscar da API, se não conseguir, usa o fallback estático
  let catalog = await fetchWorkoutApiExercises()
  if (catalog.length === 0) {
    catalog = exerciseCatalogStatic
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href={`/${gymSlug}/admin/students/${studentId}`}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">{workout.name}</h1>
          <p className="text-zinc-500 text-sm">Prescreva os exercícios, séries e carga para o aluno.</p>
        </div>
      </div>

      {/* Client Component para seleção de exercícios (reutilizado) */}
      <ExerciseSelector 
        workoutId={workoutId}
        gymSlug={gymSlug}
        initialExercises={existingExercises}
        catalog={catalog}
      />
    </div>
  )
}
