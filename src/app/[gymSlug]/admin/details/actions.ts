"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const brandingSchema = z.object({
  gymId: z.string(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
})

export async function updateGymBrandingAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }

  const data = {
    gymId: formData.get("gymId") as string,
    primaryColor: (formData.get("primaryColorText") || formData.get("primaryColor")) as string,
    secondaryColor: (formData.get("secondaryColorText") || formData.get("secondaryColor")) as string,
    logoUrl: formData.get("logoUrl") as string,
  }

  try {
    const validated = brandingSchema.parse(data)

    // Verificar permissão (somente ADMIN da própria academia ou Super Admin)
    const gym = await prisma.gym.findUnique({ where: { id: validated.gymId } })
    if (!gym) return { error: "Academia não encontrada" }

    if ((session.user as any).gymId !== gym.id && (session.user as any).role !== "ADMIN") {
      // Se não for admin da própria, checar se é Super Admin (gymId null)
      if ((session.user as any).gymId !== null) {
        return { error: "Sem permissão" }
      }
    }

    await prisma.gym.update({
      where: { id: validated.gymId },
      data: {
        primaryColor: validated.primaryColor,
        secondaryColor: validated.secondaryColor,
        logoUrl: validated.logoUrl || null,
      }
    })

    revalidatePath(`/${gym.slug}/admin/details`)
    revalidatePath(`/${gym.slug}`)
    
    return { success: true }
  } catch (error) {
    console.error("Error updating branding:", error)
    return { error: "Dados inválidos ou erro no servidor" }
  }
}
