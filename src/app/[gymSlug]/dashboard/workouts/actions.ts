"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CreateWorkoutSchema, UpdateWorkoutExercisesSchema } from "@/lib/validations/features"

export async function createWorkoutAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }

  const gymSlug = formData.get("gymSlug") as string
  let gymId: string | null = null
  if (gymSlug && gymSlug !== "me") {
    const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
    if (gym) gymId = gym.id
  }

  const rawData = {
    name: formData.get("name"),
    performedAt: formData.get("performedAt"),
  }

  const validatedData = CreateWorkoutSchema.safeParse(rawData)
  
  if (!validatedData.success) {
    return { error: validatedData.error.errors[0].message }
  }

  const { name, performedAt } = validatedData.data

  const workout = await prisma.workout.create({
    data: {
      userId: session.user.id!,
      gymId,
      name,
      durationMinutes: null,
      caloriesBurned: null,
      performedAt,
      exercises: [],
    }
  })

  const basePath = `/${gymSlug}/dashboard`
  revalidatePath(basePath)
  revalidatePath(`${basePath}/workouts`)
  
  // Redireciona para a página de edição do treino
  redirect(`${basePath}/workouts/${workout.id}`)
}

export async function updateWorkoutExercisesAction(rawData: {
  workoutId: string
  gymSlug: string
  exercises: Array<{
    id: string
    name: string
    category: string
    sets: number
    reps: string
    weight?: number
    imageUrl?: string
    notes?: string
  }>
}) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }

  const { workoutId, gymSlug, exercises } = rawData

  // Verifica se o treino pertence ao usuário
  const workout = await prisma.workout.findUnique({
    where: { id: workoutId }
  })

  if (!workout || workout.userId !== session.user.id) {
    return { error: "Treino não encontrado ou sem permissão." }
  }

  await prisma.workout.update({
    where: { id: workoutId },
    data: {
      exercises: exercises as unknown as Record<string, unknown>[],
    }
  })

  const basePath = `/${gymSlug}/dashboard`
  revalidatePath(basePath)
  revalidatePath(`${basePath}/workouts`)
  revalidatePath(`${basePath}/workouts/${workoutId}`)
  
  return { data: "Exercícios atualizados com sucesso!" }
}

export async function deleteWorkoutAction(workoutId: string, gymSlug: string = "me") {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Não autorizado" }

    // Verify ownership
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    })

    if (!workout || workout.userId !== session.user.id) {
      return { error: "Treino não encontrado ou sem permissão." }
    }

    await prisma.workout.delete({
      where: { id: workoutId }
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/workouts`)
    
    return { data: "Treino removido." }
  } catch (error) {
    console.error("Error deleting workout:", error)
    return { error: "Erro ao remover o treino." }
  }
}
