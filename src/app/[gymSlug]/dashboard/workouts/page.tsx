import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { createWorkoutAction, deleteWorkoutAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dumbbell, Plus, Trash2, ChevronRight, Edit } from "lucide-react"
import { findExerciseById } from "@/lib/exercise-data"

interface WorkoutExercise {
  id: string
  name: string
  category: string
  sets: number
  reps: string
  weight?: number
  imageUrl?: string
}

export default async function WorkoutsPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  let organizationId: string | null = null
  if (gymSlug !== "me") {
    const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
    if (!gym) redirect("/me/dashboard")
    organizationId = gym.id
  }

  const workouts = await prisma.workout.findMany({
    where: { 
      userId: session.user.id,
      organizationId: organizationId 
    },
    orderBy: { performedAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Meus Treinos</h1>
          <p className="text-zinc-400 mt-1">Crie treinos e monte sua rotina de exercícios.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulário de Novo Treino — Simplificado */}
        <div className="lg:col-span-1">
          <div className="bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Dumbbell className="w-24 h-24 text-primary" />
            </div>
            
            <h2 className="text-lg font-heading font-bold text-white mb-6 relative z-10 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              Novo Treino
            </h2>

            <form action={createWorkoutAction} className="space-y-4 relative z-10">
              <input type="hidden" name="gymSlug" value={gymSlug} />
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Nome do Treino</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Ex: Treino A - Peito e Tríceps" 
                  required 
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="performedAt" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Data</Label>
                <Input 
                  id="performedAt" 
                  name="performedAt" 
                  type="datetime-local" 
                  required 
                  defaultValue={new Date().toISOString().slice(0, 16)}
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-10"
                  style={{ colorScheme: "dark" }}
                />
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all mt-4">
                Continuar →
              </Button>
            </form>
          </div>
        </div>

        {/* Histórico de Treinos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-heading font-bold text-white mb-4">Meus Treinos</h2>
          
          {workouts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md">
              <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-zinc-300 font-medium">Nenhum treino criado</h3>
              <p className="text-sm text-zinc-500 mt-1">Crie seu primeiro treino ao lado.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {workouts.map((workout) => {
                const exercises = (workout.exercises as WorkoutExercise[] | null) || []
                return (
                  <div key={workout.id} className="bg-black/20 border border-white/5 hover:border-primary/30 transition-colors rounded-xl p-5 relative group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-heading font-bold text-lg text-white group-hover:text-primary transition-colors">
                          {workout.name}
                        </h3>
                        <p className="text-xs text-zinc-500">
                          {new Date(workout.performedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/${gymSlug}/dashboard/workouts/${workout.id}`}
                          className="text-zinc-500 hover:text-primary transition-colors"
                          title="Editar Exercícios"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <form action={async () => {
                          "use server"
                          await deleteWorkoutAction(workout.id, gymSlug)
                        }}>
                          <button type="submit" className="text-zinc-600 hover:text-destructive transition-colors" title="Remover Treino">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </form>
                      </div>
                    </div>
                    
                    {exercises.length > 0 ? (
                      <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5">
                        {exercises.map((ex, i) => (
                          <div key={i} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {ex.imageUrl && (
                                <img src={ex.imageUrl} alt={ex.name} className="w-5 h-5 rounded-sm object-cover bg-white/5" />
                              )}
                              <span className="text-zinc-300">{ex.name}</span>
                            </div>
                            <span className="text-zinc-500">
                              {ex.sets}x{ex.reps}
                              {ex.weight ? ` · ${ex.weight}kg` : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link 
                        href={`/${gymSlug}/dashboard/workouts/${workout.id}`}
                        className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 hover:text-primary transition-colors"
                      >
                        <span>Nenhum exercício adicionado</span>
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
