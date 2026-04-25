"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { CreateWorkoutSchema, UpdateWorkoutExercisesSchema } from "@/lib/validations/features"
import { requireAuth, assertOwnership, AuthError } from "@/lib/auth-guard"
import { audit, AuditAction } from "@/lib/services/audit"

export async function createWorkoutAction(formData: FormData): Promise<void> {
  const ctx = await requireAuth()

  const gymSlug = formData.get("gymSlug") as string
  let organizationId: string | null = null
  if (gymSlug && gymSlug !== "me") {
    const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
    if (gym) organizationId = gym.id
  }

  const rawData = {
    name: formData.get("name"),
    performedAt: formData.get("performedAt"),
  }

  const validatedData = CreateWorkoutSchema.safeParse(rawData)
  
  if (!validatedData.success) {
    redirect(`/${gymSlug}/dashboard/workouts?error=${encodeURIComponent(validatedData.error.issues[0]?.message ?? "Dados inválidos")}`)
  }

  const { name, performedAt } = validatedData.data

  const workout = await prisma.workout.create({
    data: {
      userId: ctx.userId,
      organizationId,
      name,
      durationMinutes: null,
      caloriesBurned: null,
      performedAt,
      exercises: [],
      isTemplate: true,
    }
  })

  await audit(ctx.userId, AuditAction.WORKOUT_CREATE, {
    organizationId,
    targetType: "Workout",
    targetId: workout.id,
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
  try {
    const ctx = await requireAuth()

    const { workoutId, gymSlug, exercises } = rawData

    // Anti-IDOR: busca o treino e verifica ownership no banco
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    })

    if (!workout) {
      return { error: "Treino não encontrado." }
    }

    // Aceitar se é dono ou se é quem criou (Coach)
    if (workout.userId !== ctx.userId && workout.createdById !== ctx.userId) {
      return { error: "Sem permissão para alterar este treino." }
    }

    await prisma.workout.update({
      where: { id: workoutId },
      data: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        exercises: exercises as any,
      }
    })

    await audit(ctx.userId, AuditAction.WORKOUT_UPDATE, {
      targetType: "Workout",
      targetId: workoutId,
      organizationId: workout.organizationId,
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/workouts`)
    revalidatePath(`${basePath}/workouts/${workoutId}`)
    
    return { data: "Exercícios atualizados com sucesso!" }
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error updating exercises:", error)
    return { error: "Erro ao atualizar exercícios." }
  }
}

export async function deleteWorkoutAction(workoutId: string, gymSlug: string = "me") {
  try {
    const ctx = await requireAuth()

    // Anti-IDOR: busca o treino e verifica ownership
    const workout = await prisma.workout.findUnique({
      where: { id: workoutId }
    })

    if (!workout) {
      return { error: "Treino não encontrado." }
    }

    assertOwnership(workout.userId, ctx.userId, "treino")

    await prisma.workout.delete({
      where: { id: workoutId }
    })

    await audit(ctx.userId, AuditAction.WORKOUT_DELETE, {
      targetType: "Workout",
      targetId: workoutId,
      organizationId: workout.organizationId,
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/workouts`)
    
    return { data: "Treino removido." }
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error deleting workout:", error)
    return { error: "Erro ao remover o treino." }
  }
}
