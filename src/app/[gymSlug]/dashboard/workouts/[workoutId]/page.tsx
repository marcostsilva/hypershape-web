import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ExerciseSelector } from "./exercise-selector"
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

export default async function WorkoutEditPage({ params }: { params: Promise<{ gymSlug: string; workoutId: string }> }) {
  const { gymSlug, workoutId } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const workout = await prisma.workout.findUnique({
    where: { id: workoutId }
  })

  if (!workout || workout.userId !== session.user.id) {
    redirect(`/${gymSlug}/dashboard/workouts`)
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
      <div className="flex items-center gap-4">
        <Link 
          href={`/${gymSlug}/dashboard/workouts`}
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-bold text-white tracking-tight">{workout.name}</h1>
          <p className="text-zinc-500 text-sm">Selecione exercícios e configure séries, repetições e carga.</p>
        </div>
      </div>

      {/* Client Component para seleção de exercícios */}
      <ExerciseSelector 
        workoutId={workoutId}
        gymSlug={gymSlug}
        initialExercises={existingExercises}
        catalog={catalog}
      />
    </div>
  )
}
