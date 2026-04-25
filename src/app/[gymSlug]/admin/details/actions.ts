"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { sanitizeString } from "@/lib/sanitize"
import { requireOrgAdmin, AuthError } from "@/lib/auth-guard"
import { audit, AuditAction } from "@/lib/services/audit"

const brandingSchema = z.object({
  organizationId: z.string(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal("")),
})

export async function updateGymBrandingAction(formData: FormData) {
  const session = await auth()
  if (!session?.user) return { error: "Não autorizado" }

  const data = {
    organizationId: formData.get("organizationId") as string,
    primaryColor: (formData.get("primaryColorText") || formData.get("primaryColor")) as string,
    secondaryColor: (formData.get("secondaryColorText") || formData.get("secondaryColor")) as string,
    logoUrl: formData.get("logoUrl") as string,
  }

  try {
    const validated = brandingSchema.parse(data)

    // Buscar slug para validação de membership
    const gym = await prisma.organization.findUnique({ 
      where: { id: validated.organizationId },
      select: { slug: true }
    })
    if (!gym) return { error: "Academia não encontrada" }

    // Auth Guard: valida ADMIN real no banco (não confia só no JWT)
    await requireOrgAdmin(gym.slug)

    await prisma.organization.update({
      where: { id: validated.organizationId },
      data: {
        primaryColor: validated.primaryColor,
        secondaryColor: validated.secondaryColor,
        logoUrl: validated.logoUrl || null,
      }
    })

    await audit(session.user.id!, AuditAction.ORG_BRANDING_UPDATE, {
      organizationId: validated.organizationId,
      targetType: "Organization",
      targetId: validated.organizationId,
      metadata: { primaryColor: validated.primaryColor, secondaryColor: validated.secondaryColor }
    })

    revalidatePath(`/${gym.slug}/admin/details`)
    revalidatePath(`/${gym.slug}`)
    
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error updating branding:", error)
    return { error: "Dados inválidos ou erro no servidor" }
  }
}
