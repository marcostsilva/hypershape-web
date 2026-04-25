"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { sanitizeString } from "@/lib/sanitize"
import { requireCoachOrAdmin, AuthError } from "@/lib/auth-guard"
import { audit, AuditAction } from "@/lib/services/audit"

export async function createStudentWorkoutAction(formData: FormData): Promise<void> {
  const gymSlug = formData.get("gymSlug") as string
  const studentId = formData.get("studentId") as string
  const rawName = (formData.get("name") as string)?.trim()
  const name = rawName ? sanitizeString(rawName) : ""

  if (!name) {
    redirect(`/${gymSlug}/admin/students/${studentId}/workouts/new?error=${encodeURIComponent("Nome do treino é obrigatório.")}`)
  }

  // Auth Guard: verifica Coach ou Admin da organização
  const ctx = await requireCoachOrAdmin(gymSlug)

  const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
  if (!gym) redirect(`/${gymSlug}/admin/students`)

  // Verificar que o aluno pertence a esta organização
  const membership = await prisma.membership.findFirst({
    where: {
      userId: studentId,
      organizationId: gym.id,
      status: "ACTIVE"
    }
  })

  if (!membership) {
    redirect(`/${gymSlug}/admin/students?error=${encodeURIComponent("Aluno não encontrado nesta organização.")}`)
  }

  const workout = await prisma.workout.create({
    data: {
      userId: studentId,
      organizationId: gym.id,
      createdById: ctx.userId,
      name,
      durationMinutes: null,
      caloriesBurned: null,
      performedAt: new Date(),
      exercises: [],
      isTemplate: true,
    }
  })

  await audit(ctx.userId, AuditAction.WORKOUT_PRESCRIBE, {
    organizationId: gym.id,
    targetType: "Workout",
    targetId: workout.id,
    metadata: { studentId, workoutName: name }
  })

  const basePath = `/${gymSlug}/admin/students/${studentId}`
  revalidatePath(basePath)

  // Redireciona para editar os exercícios do treino
  redirect(`${basePath}/workouts/${workout.id}`)
}
