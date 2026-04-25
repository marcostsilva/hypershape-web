"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CreateMeasurementSchema } from "@/lib/validations/features"
import { requireAuth, assertOwnership, AuthError } from "@/lib/auth-guard"
import { audit, AuditAction } from "@/lib/services/audit"

export async function createMeasurementAction(formData: FormData) {
  try {
    const ctx = await requireAuth()

    const gymSlug = formData.get("gymSlug") as string
    let organizationId: string | null = null
    if (gymSlug && gymSlug !== "me") {
      const gym = await prisma.organization.findUnique({ where: { slug: gymSlug } })
      if (gym) organizationId = gym.id
    }

    const rawData = {
      weight: formData.get("weight"),
      bodyFat: formData.get("bodyFat") || undefined,
      measuredAt: formData.get("measuredAt"),
      measurements: {
        height: formData.get("height") || undefined,
        chest: formData.get("chest") || undefined,
        neck: formData.get("neck") || undefined,
        waist: formData.get("waist") || undefined,
        hips: formData.get("hips") || undefined,
        glutes: formData.get("glutes") || undefined,
        armRight: formData.get("armRight") || undefined,
        armLeft: formData.get("armLeft") || undefined,
        thighRight: formData.get("thighRight") || undefined,
        thighLeft: formData.get("thighLeft") || undefined,
        calfRight: formData.get("calfRight") || undefined,
        calfLeft: formData.get("calfLeft") || undefined,
      }
    }

    const validatedData = CreateMeasurementSchema.safeParse(rawData)
    
    if (!validatedData.success) {
      return { error: validatedData.error.issues[0]?.message ?? "Dados inválidos" }
    }

    const { weight, bodyFat, measuredAt, measurements } = validatedData.data

    // Filtrar campos undefined do JSON antes de salvar
    const cleanMeasurements = Object.fromEntries(
      Object.entries(measurements).filter(([, v]) => v !== undefined && v !== null)
    )

    const measurement = await prisma.measurement.create({
      data: {
        userId: ctx.userId,
        organizationId,
        weight,
        bodyFat: bodyFat || null,
        measuredAt,
        measurements: cleanMeasurements,
      }
    })

    await audit(ctx.userId, AuditAction.MEASUREMENT_CREATE, {
      organizationId,
      targetType: "Measurement",
      targetId: measurement.id,
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/measurements`)
    
    return { data: "Medidas registradas com sucesso!" }
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error creating measurement:", error)
    return { error: "Erro ao registrar as medidas." }
  }
}

export async function deleteMeasurementAction(measurementId: string, gymSlug: string = "me") {
  try {
    const ctx = await requireAuth()

    // Anti-IDOR: busca o recurso e valida ownership
    const measurement = await prisma.measurement.findUnique({
      where: { id: measurementId }
    })

    if (!measurement) {
      return { error: "Medida não encontrada." }
    }

    assertOwnership(measurement.userId, ctx.userId, "medida")

    await prisma.measurement.delete({
      where: { id: measurementId }
    })

    await audit(ctx.userId, AuditAction.MEASUREMENT_DELETE, {
      targetType: "Measurement",
      targetId: measurementId,
      organizationId: measurement.organizationId,
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/measurements`)
    
    return { data: "Registro removido." }
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error deleting measurement:", error)
    return { error: "Erro ao remover o registro." }
  }
}
