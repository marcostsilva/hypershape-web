"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createStudentWorkoutAction(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const gymSlug = formData.get("gymSlug") as string
  const studentId = formData.get("studentId") as string
  const name = (formData.get("name") as string)?.trim()

  if (!name) {
    redirect(`/${gymSlug}/admin/students/${studentId}/workouts/new?error=${encodeURIComponent("Nome do treino é obrigatório.")}`)
  }

  const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
  if (!gym) redirect(`/${gymSlug}/admin/students`)

  const workout = await prisma.workout.create({
    data: {
      userId: studentId,
      gymId: gym.id,
      createdById: session.user.id!,
      name,
      durationMinutes: null,
      caloriesBurned: null,
      performedAt: new Date(),
      exercises: [],
      isTemplate: true, // Treino planejado — só vira histórico quando executado no app
    }
  })

  const basePath = `/${gymSlug}/admin/students/${studentId}`
  revalidatePath(basePath)

  // Redireciona para editar os exercícios do treino
  redirect(`${basePath}/workouts/${workout.id}`)
}
