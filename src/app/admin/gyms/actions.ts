"use server"

import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const gymSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").toLowerCase(),
  cnpj: z.string().optional(),
  corporateName: z.string().optional(),
  tradeName: z.string().optional(),
  address: z.string().optional(),
  ownerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  plan: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]),
  studentLimit: z.number().int().min(1),
})

async function checkSuperAdmin() {
  const session = await auth()
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    throw new Error("Acesso negado")
  }
  return session
}

export async function createGymAction(formData: z.infer<typeof gymSchema>) {
  try {
    await checkSuperAdmin()
    const validated = gymSchema.parse(formData)
    
    // Verificar se o proprietário existe caso o e-mail tenha sido informado
    if (validated.ownerEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: validated.ownerEmail }
      })
      if (!owner) {
        throw new Error(`Usuário com e-mail ${validated.ownerEmail} não encontrado. Cadastre o usuário primeiro.`)
      }
    }

    const gym = await prisma.gym.create({
      data: validated
    })

    // Se informou proprietário, vincula e promove
    if (validated.ownerEmail) {
      await prisma.user.update({
        where: { email: validated.ownerEmail },
        data: {
          role: 'ADMIN',
          gymId: gym.id,
          mode: 'MANAGED'
        }
      })
    }
    
    revalidatePath("/admin")
    return { data: gym }
  } catch (error: any) {
    return { error: error.message || "Erro ao criar academia" }
  }
}

export async function updateGymAction(id: string, formData: z.infer<typeof gymSchema>) {
  try {
    await checkSuperAdmin()
    const validated = gymSchema.parse(formData)
    
    if (validated.ownerEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: validated.ownerEmail }
      })
      if (!owner) {
        throw new Error(`Usuário com e-mail ${validated.ownerEmail} não encontrado.`)
      }
    }

    const gym = await prisma.gym.update({
      where: { id },
      data: validated
    })

    if (validated.ownerEmail) {
      await prisma.user.update({
        where: { email: validated.ownerEmail },
        data: {
          role: 'ADMIN',
          gymId: gym.id,
          mode: 'MANAGED'
        }
      })
    }
    
    revalidatePath("/admin")
    revalidatePath(`/admin/gyms/${id}`)
    return { data: gym }
  } catch (error: any) {
    return { error: error.message || "Erro ao atualizar academia" }
  }
}

export async function deleteGymAction(id: string) {
  try {
    await checkSuperAdmin()
    
    await prisma.gym.delete({ where: { id } })
    
    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    return { error: error.message || "Erro ao deletar academia" }
  }
}
