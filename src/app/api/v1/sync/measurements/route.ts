import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { z } from "zod"

const measurementSyncSchema = z.object({
  measurements: z.array(z.object({
    clientSideUuid: z.string().uuid(),
    weight: z.number(),
    bodyFat: z.number().optional(),
    measurements: z.any(), // JSON detalhado
    measuredAt: z.string().datetime(),
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

  try {
    const body = await req.json()
    const { measurements } = measurementSyncSchema.parse(body)

    const results = []

    for (const item of measurements) {
      const incomingUpdate = item.updatedAt ? new Date(item.updatedAt) : new Date()
      
      const existing = await prisma.measurement.findUnique({
        where: { clientSideUuid: item.clientSideUuid },
        select: { id: true, updatedAt: true }
      })

      if (!existing) {
        const saved = await prisma.measurement.create({
          data: {
            userId,
            organizationId: item.organizationId,
            weight: item.weight,
            bodyFat: item.bodyFat,
            measurements: item.measurements,
            measuredAt: new Date(item.measuredAt),
            clientSideUuid: item.clientSideUuid,
            updatedAt: incomingUpdate
          }
        })
        results.push({ id: saved.id, status: "created" })
      } else if (incomingUpdate > existing.updatedAt) {
        const updated = await prisma.measurement.update({
          where: { id: existing.id },
          data: {
            weight: item.weight,
            bodyFat: item.bodyFat,
            measurements: item.measurements,
            measuredAt: new Date(item.measuredAt),
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
    console.error("Sync measurements error:", error)
    return NextResponse.json({ 
      error: "Erro na sincronização de medidas", 
      details: error instanceof z.ZodError ? error.issues : "Dados inválidos" 
    }, { status: 400 })
  }
}
