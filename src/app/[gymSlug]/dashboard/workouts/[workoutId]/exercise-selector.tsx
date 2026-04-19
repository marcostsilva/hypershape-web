"use client"

import { useState, useTransition } from "react"
import { updateWorkoutExercisesAction } from "../actions"
import { ChevronDown, ChevronUp, Check, Save, Loader2, X, Plus, Minus } from "lucide-react"
import type { ExerciseCategory } from "@/lib/exercise-data"

interface SelectedExercise {
  id: string
  name: string
  category: string
  sets: number
  reps: string
  weight?: number
  imageUrl?: string
  notes?: string
}

interface ExerciseSelectorProps {
  workoutId: string
  gymSlug: string
  initialExercises: SelectedExercise[]
  catalog: ExerciseCategory[]
}

export function ExerciseSelector({ workoutId, gymSlug, initialExercises, catalog }: ExerciseSelectorProps) {
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercise[]>(initialExercises)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [expandedConfig, setExpandedConfig] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const isSelected = (exerciseId: string) => {
    return selectedExercises.some(e => e.id === exerciseId)
  }

  const toggleExercise = (exerciseId: string, exerciseName: string, category: string, imageUrl?: string) => {
    if (isSelected(exerciseId)) {
      setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId))
      if (expandedConfig === exerciseId) setExpandedConfig(null)
    } else {
      setSelectedExercises(prev => [...prev, {
        id: exerciseId,
        name: exerciseName,
        category,
        imageUrl,
        sets: 3,
        reps: "12",
        weight: undefined,
        notes: undefined,
      }])
      setExpandedConfig(exerciseId)
    }
  }

  const updateExercise = (exerciseId: string, field: keyof SelectedExercise, value: string | number | undefined) => {
    setSelectedExercises(prev => prev.map(e => {
      if (e.id === exerciseId) {
        return { ...e, [field]: value }
      }
      return e
    }))
  }

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateWorkoutExercisesAction({
        workoutId,
        gymSlug,
        exercises: selectedExercises,
      })
      if (result?.error) {
        setSaveMessage(result.error)
      } else {
        setSaveMessage("Salvo com sucesso!")
        setTimeout(() => setSaveMessage(null), 3000)
      }
    })
  }

  const selectedCount = selectedExercises.length

  return (
    <div className="space-y-6">
      {/* Barra fixa de resumo + salvar */}
      <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-sm font-bold border border-primary/30">
            {selectedCount} exercício{selectedCount !== 1 ? "s" : ""}
          </div>
          {saveMessage && (
            <span className={`text-sm font-medium ${saveMessage.includes("sucesso") ? "text-emerald-400" : "text-red-400"}`}>
              {saveMessage}
            </span>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-5 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Salvar
        </button>
      </div>

      {/* Exercícios selecionados com config */}
      {selectedExercises.length > 0 && (
        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 space-y-2">
          <h3 className="text-xs uppercase tracking-widest text-primary font-bold mb-3 ml-1">Exercícios no Treino</h3>
          {selectedExercises.map((ex) => (
            <div key={ex.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div 
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setExpandedConfig(expandedConfig === ex.id ? null : ex.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  {ex.imageUrl && (
                    <img 
                      src={ex.imageUrl} 
                      alt={ex.name} 
                      className="w-10 h-10 object-cover rounded-md bg-white/5 border border-white/10"
                    />
                  )}
                  <div>
                    <span className="text-sm font-medium text-white">{ex.name}</span>
                    <span className="text-xs text-zinc-500 ml-2">
                      {ex.sets}x{ex.reps}{ex.weight ? ` · ${ex.weight}kg` : ""}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleExercise(ex.id, ex.name, ex.category, ex.imageUrl)
                    }}
                    className="text-zinc-600 hover:text-destructive transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {expandedConfig === ex.id ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              </div>
              
              {/* Config expandida */}
              {expandedConfig === ex.id && (
                <div className="px-3 pb-3 pt-1 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="grid grid-cols-3 gap-3">
                    {/* Séries */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Séries</label>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateExercise(ex.id, "sets", Math.max(1, ex.sets - 1))}
                          className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, "sets", Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-12 h-8 bg-white/5 border border-white/10 rounded-lg text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={() => updateExercise(ex.id, "sets", ex.sets + 1)}
                          className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Repetições */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Reps</label>
                      <input
                        type="text"
                        value={ex.reps}
                        onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                        placeholder="12"
                        className="w-full h-8 bg-white/5 border border-white/10 rounded-lg text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Carga */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-zinc-500 ml-1">Carga (kg)</label>
                      <input
                        type="number"
                        value={ex.weight || ""}
                        onChange={(e) => updateExercise(ex.id, "weight", e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="—"
                        className="w-full h-8 bg-white/5 border border-white/10 rounded-lg text-center text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Catálogo de Exercícios por Categoria */}
      <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-heading font-bold text-white">Selecione exercícios</h3>
        </div>

        <div className="divide-y divide-white/5">
          {catalog.map((category) => {
            const isExpanded = expandedCategories.has(category.name)
            const selectedInCategory = selectedExercises.filter(e => e.category === category.name).length

            return (
              <div key={category.name}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary">{category.name}</span>
                    {selectedInCategory > 0 && (
                      <span className="bg-primary/20 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </button>

                {/* Exercise List */}
                {isExpanded && (
                  <div className="bg-black/20 animate-in fade-in slide-in-from-top-2 duration-200">
                    {category.exercises.map((exercise) => {
                      const selected = isSelected(exercise.id)
                      return (
                        <button
                          key={exercise.id}
                          onClick={() => toggleExercise(exercise.id, exercise.name, category.name, exercise.imageUrl)}
                          className={`w-full flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors border-t border-white/[0.03] ${
                            selected ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {exercise.imageUrl && (
                              <img 
                                src={exercise.imageUrl} 
                                alt={exercise.name} 
                                className="w-10 h-10 object-cover rounded-md bg-white/5 border border-white/10"
                              />
                            )}
                            <span className={`text-sm ${selected ? "text-white font-medium" : "text-zinc-400"}`}>
                              {exercise.name}
                            </span>
                          </div>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                            selected 
                              ? "bg-primary border-primary" 
                              : "border-zinc-600"
                          }`}>
                            {selected && <Check className="w-3 h-3 text-black" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
