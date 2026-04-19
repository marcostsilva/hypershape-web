"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { CreateMeasurementSchema } from "@/lib/validations/features"

export async function createMeasurementAction(formData: FormData) {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Não autorizado" }

    const gymSlug = formData.get("gymSlug") as string
    let gymId: string | null = null
    if (gymSlug && gymSlug !== "me") {
      const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
      if (gym) gymId = gym.id
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
      return { error: validatedData.error.errors[0].message }
    }

    const { weight, bodyFat, measuredAt, measurements } = validatedData.data

    // Filtrar campos undefined do JSON antes de salvar
    const cleanMeasurements = Object.fromEntries(
      Object.entries(measurements).filter(([, v]) => v !== undefined && v !== null)
    )

    await prisma.measurement.create({
      data: {
        userId: session.user.id!,
        gymId: gymId,
        weight,
        bodyFat: bodyFat || null,
        measuredAt,
        measurements: cleanMeasurements,
      }
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/measurements`)
    
    return { data: "Medidas registradas com sucesso!" }
  } catch (error) {
    console.error("Error creating measurement:", error)
    return { error: "Erro ao registrar as medidas." }
  }
}

export async function deleteMeasurementAction(measurementId: string, gymSlug: string = "me") {
  try {
    const session = await auth()
    if (!session?.user) return { error: "Não autorizado" }

    const measurement = await prisma.measurement.findUnique({
      where: { id: measurementId }
    })

    if (!measurement || measurement.userId !== session.user.id) {
      return { error: "Medida não encontrada ou sem permissão." }
    }

    await prisma.measurement.delete({
      where: { id: measurementId }
    })

    const basePath = `/${gymSlug}/dashboard`
    revalidatePath(basePath)
    revalidatePath(`${basePath}/measurements`)
    
    return { data: "Registro removido." }
  } catch (error) {
    console.error("Error deleting measurement:", error)
    return { error: "Erro ao remover o registro." }
  }
}
