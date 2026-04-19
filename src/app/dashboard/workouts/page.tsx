import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createWorkoutAction, deleteWorkoutAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dumbbell, Plus, Trash2 } from "lucide-react"

export default async function WorkoutsPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { performedAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Meus Treinos</h1>
          <p className="text-zinc-400 mt-1">Registre e acompanhe suas sessões de treinamento.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulário de Novo Treino */}
        <div className="lg:col-span-1">
          <div className="bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Plus className="w-24 h-24 text-primary" />
            </div>
            
            <h2 className="text-lg font-heading font-bold text-white mb-6 relative z-10 flex items-center">
              <Dumbbell className="w-5 h-5 mr-2 text-primary" />
              Novo Treino
            </h2>

            <form action={createWorkoutAction} className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Nome do Treino</Label>
                <Input 
                  id="name" 
                  name="name" 
                  placeholder="Ex: Peito e Tríceps" 
                  required 
                  className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-10"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Duração (min)</Label>
                  <Input 
                    id="durationMinutes" 
                    name="durationMinutes" 
                    type="number" 
                    min="1" 
                    placeholder="60" 
                    required 
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caloriesBurned" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">Kcal (Opcional)</Label>
                  <Input 
                    id="caloriesBurned" 
                    name="caloriesBurned" 
                    type="number" 
                    placeholder="300" 
                    className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-10"
                  />
                </div>
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
                Salvar Treino
              </Button>
            </form>
          </div>
        </div>

        {/* Histórico de Treinos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-heading font-bold text-white mb-4">Histórico Recente</h2>
          
          {workouts.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md">
              <Dumbbell className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-zinc-300 font-medium">Nenhum treino registrado</h3>
              <p className="text-sm text-zinc-500 mt-1">Seu histórico aparecerá aqui.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {workouts.map((workout) => (
                <div key={workout.id} className="bg-black/20 border border-white/5 hover:border-primary/30 transition-colors rounded-xl p-5 relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-heading font-bold text-lg text-white group-hover:text-primary transition-colors">
                      {workout.name}
                    </h3>
                    {/* Minimal Delete Form */}
                    <form action={async () => {
                      "use server"
                      await deleteWorkoutAction(workout.id)
                    }}>
                      <button type="submit" className="text-zinc-600 hover:text-destructive transition-colors" title="Remover Treino">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                  
                  <div className="flex items-center text-xs text-zinc-400 gap-4 mt-4">
                    <span>
                      <strong className="text-white">{workout.durationMinutes}</strong> min
                    </span>
                    {workout.caloriesBurned && (
                      <span>
                        <strong className="text-white">{workout.caloriesBurned}</strong> kcal
                      </span>
                    )}
                    <span className="ml-auto">
                      {new Date(workout.performedAt).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
