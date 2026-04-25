import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const workoutSyncSchema = z.object({
  workouts: z.array(z.object({
    clientSideUuid: z.string().uuid(),
    name: z.string(),
    exercises: z.any(),
    durationMinutes: z.number().optional(),
    caloriesBurned: z.number().optional(),
    performedAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    organizationId: z.string().optional()
  }))
})

export async function POST(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = session.user.id!
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBlocked: true }
  })

  if (!user || user.isBlocked) {
    return NextResponse.json({ error: "Acesso bloqueado" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { workouts } = workoutSyncSchema.parse(body)

    const results = []

    for (const workout of workouts) {
      const incomingUpdate = workout.updatedAt ? new Date(workout.updatedAt) : new Date()
      
      // Buscar se já existe
      const existing = await prisma.workout.findUnique({
        where: { clientSideUuid: workout.clientSideUuid },
        select: { id: true, updatedAt: true }
      })

      if (!existing) {
        // Criar novo
        const saved = await prisma.workout.create({
          data: {
            userId,
            organizationId: workout.organizationId,
            name: workout.name,
            exercises: workout.exercises,
            durationMinutes: workout.durationMinutes,
            caloriesBurned: workout.caloriesBurned,
            performedAt: new Date(workout.performedAt),
            clientSideUuid: workout.clientSideUuid,
            updatedAt: incomingUpdate
          }
        })
        results.push({ id: saved.id, status: "created" })
      } else if (incomingUpdate > existing.updatedAt) {
        // Atualizar se o recebido for mais novo (Last Write Wins)
        const updated = await prisma.workout.update({
          where: { id: existing.id },
          data: {
            name: workout.name,
            exercises: workout.exercises,
            durationMinutes: workout.durationMinutes,
            caloriesBurned: workout.caloriesBurned,
            performedAt: new Date(workout.performedAt),
            updatedAt: incomingUpdate
          }
        })
        results.push({ id: updated.id, status: "updated" })
      } else {
        results.push({ id: existing.id, status: "skipped" })
      }
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: results.length,
      results 
    })

  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ 
      error: "Erro na sincronização", 
      details: error instanceof z.ZodError ? error.issues : "Dados inválidos" 
    }, { status: 400 })
  }
}
