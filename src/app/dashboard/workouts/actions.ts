"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CreateWorkoutSchema } from "@/lib/validations/features"

export async function createWorkoutAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Não autorizado" }

    const rawData = {
      name: formData.get("name"),
      durationMinutes: formData.get("durationMinutes"),
      caloriesBurned: formData.get("caloriesBurned"),
      performedAt: formData.get("performedAt"),
      // exercises will be handled differently or set as default empty for now
    }

    const validatedData = CreateWorkoutSchema.safeParse(rawData)
    
    if (!validatedData.success) {
      return { error: validatedData.error.errors[0].message }
    }

    const { name, durationMinutes, caloriesBurned, performedAt, exercises } = validatedData.data

    await prisma.workout.create({
      data: {
        userId: session.user.id!,
        gymId: session.user.gymId || null, // multi-tenant filter
        name,
        durationMinutes,
        caloriesBurned: caloriesBurned || null,
        performedAt,
        exercises: exercises as any,
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/workouts")
    
    return { data: "Treino registrado com sucesso!" }
  } catch (error) {
    console.error("Error creating workout:", error)
    return { error: "Erro ao registrar o treino." }
  }
}

export async function deleteWorkoutAction(workoutId: string) {
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

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/workouts")
    
    return { data: "Treino removido." }
  } catch (error) {
    console.error("Error deleting workout:", error)
    return { error: "Erro ao remover o treino." }
  }
}
