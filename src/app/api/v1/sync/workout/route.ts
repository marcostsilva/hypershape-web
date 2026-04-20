import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const workoutSyncSchema = z.object({
  workouts: z.array(z.object({
    clientSideUuid: z.string().uuid(),
    name: z.string(),
    exercises: z.any(), // JSON de exercícios
    durationMinutes: z.number().optional(),
    caloriesBurned: z.number().optional(),
    performedAt: z.string().datetime(),
    gymId: z.string().optional()
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
    select: { accessStatus: true, isBlocked: true }
  })

  if (!user || user.isBlocked || user.accessStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Acesso bloqueado ou inativo" }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { workouts } = workoutSyncSchema.parse(body)

    const results = []

    for (const workout of workouts) {
      // Upsert para garantir idempotência via clientSideUuid
      const saved = await prisma.workout.upsert({
        where: { clientSideUuid: workout.clientSideUuid },
        update: {}, // Não atualiza nada se já existir
        create: {
          userId,
          gymId: workout.gymId,
          name: workout.name,
          exercises: workout.exercises,
          durationMinutes: workout.durationMinutes,
          caloriesBurned: workout.caloriesBurned,
          performedAt: new Date(workout.performedAt),
          clientSideUuid: workout.clientSideUuid
        }
      })
      results.push(saved.id)
    }

    return NextResponse.json({ 
      success: true, 
      syncedCount: results.length,
      ids: results 
    })

  } catch (error) {
    console.error("Sync error:", error)
    return NextResponse.json({ 
      error: "Erro na sincronização", 
      details: error instanceof z.ZodError ? error.issues : "Dados inválidos" 
    }, { status: 400 })
  }
}
