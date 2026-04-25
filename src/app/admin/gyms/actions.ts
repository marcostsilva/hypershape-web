"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { sanitizeString } from "@/lib/sanitize"
import { requireSuperAdmin, AuthError } from "@/lib/auth-guard"
import { audit, AuditAction } from "@/lib/services/audit"

function validateCNPJ(cnpj: string) {
  cnpj = cnpj.replace(/[^\d]+/g, '')
  if (cnpj === '') return true // Opcional no schema
  if (cnpj.length !== 14) return false

  // Elimina CNPJs conhecidos inválidos
  if (/^(\d)\1+$/.test(cnpj)) return false

  // Valida DVs
  let tamanho = cnpj.length - 2
  let numeros = cnpj.substring(0, tamanho)
  let digitos = cnpj.substring(tamanho)
  let soma = 0
  let pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(0))) return false

  tamanho = tamanho + 1
  numeros = cnpj.substring(0, tamanho)
  soma = 0
  pos = tamanho - 7
  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--
    if (pos < 2) pos = 9
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11)
  if (resultado !== parseInt(digitos.charAt(1))) return false

  return true
}

const gymSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres").transform(sanitizeString),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").toLowerCase(),
  cnpj: z.string().refine((val) => validateCNPJ(val), {
    message: "CNPJ inválido",
  }).optional().or(z.literal("")),
  corporateName: z.string().optional().or(z.literal("")).transform(v => v ? sanitizeString(v) : v),
  tradeName: z.string().optional().or(z.literal("")).transform(v => v ? sanitizeString(v) : v),
  
  // Endereço Estruturado
  street: z.string().optional().or(z.literal("")).transform(v => v ? sanitizeString(v) : v),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")).transform(v => v ? sanitizeString(v) : v),
  neighborhood: z.string().optional().or(z.literal("")).transform(v => v ? sanitizeString(v) : v),
  city: z.string().optional().or(z.literal("")).transform(v => v ? sanitizeString(v) : v),
  state: z.string().optional().or(z.literal("")).refine(val => !val || val.length === 2, "UF deve ter 2 caracteres"),
  zipCode: z.string().optional().or(z.literal("")).refine(val => !val || /^\d{5}-?\d{3}$/.test(val), "CEP inválido"),
  
  ownerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  plan: z.enum(["STARTER", "PRO", "ELITE", "ENTERPRISE"]),
  maxStudents: z.number().int().min(1),
})

function handlePrismaError(error: any) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const target = (error.meta?.target as string[]) || []
      if (target.includes('slug')) return "Este slug já está em uso por outra unidade."
      if (target.includes('cnpj')) return "Este CNPJ já está cadastrado no sistema."
      if (target.includes('customDomain')) return "Este domínio já está em uso."
      return "Já existe um registro com estes dados únicos."
    }
  }
  return error.message || "Ocorreu um erro inesperado no servidor."
}

export async function createGymAction(formData: z.infer<typeof gymSchema>) {
  try {
    const ctx = await requireSuperAdmin()
    const validated = gymSchema.parse(formData)
    
    let ownerId: string | null = null
    if (validated.ownerEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: validated.ownerEmail }
      })
      if (!owner) {
        return { error: `Usuário com e-mail ${validated.ownerEmail} não encontrado. Cadastre o usuário primeiro.` }
      }
      ownerId = owner.id
    }

    const gym = await prisma.organization.create({
      data: validated
    })

    if (ownerId) {
      await prisma.membership.upsert({
        where: {
          organizationId_userId: {
            userId: ownerId,
            organizationId: gym.id
          }
        },
        update: {
          role: 'ADMIN'
        },
        create: {
          userId: ownerId,
          organizationId: gym.id,
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      })
    }

    await audit(ctx.userId, AuditAction.ORG_CREATE, {
      targetType: "Organization",
      targetId: gym.id,
      metadata: { name: validated.name, slug: validated.slug, plan: validated.plan }
    })
    
    revalidatePath("/admin")
    return { data: gym }
  } catch (error: any) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error creating gym:", error)
    return { error: handlePrismaError(error) }
  }
}

export async function updateGymAction(id: string, formData: z.infer<typeof gymSchema>) {
  try {
    const ctx = await requireSuperAdmin()
    const validated = gymSchema.parse(formData)
    
    let ownerId: string | null = null
    if (validated.ownerEmail) {
      const owner = await prisma.user.findUnique({
        where: { email: validated.ownerEmail }
      })
      if (!owner) {
        return { error: `Usuário com e-mail ${validated.ownerEmail} não encontrado.` }
      }
      ownerId = owner.id
    }

    const gym = await prisma.organization.update({
      where: { id },
      data: validated
    })

    if (ownerId) {
      await prisma.membership.upsert({
        where: {
          organizationId_userId: {
            userId: ownerId,
            organizationId: gym.id
          }
        },
        update: {
          role: 'ADMIN'
        },
        create: {
          userId: ownerId,
          organizationId: gym.id,
          role: 'ADMIN',
          status: 'ACTIVE'
        }
      })
    }

    await audit(ctx.userId, AuditAction.ORG_UPDATE, {
      targetType: "Organization",
      targetId: gym.id,
      metadata: { name: validated.name, plan: validated.plan }
    })
    
    revalidatePath("/admin")
    revalidatePath(`/admin/gyms/${id}`)
    return { data: gym }
  } catch (error: any) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error updating gym:", error)
    return { error: handlePrismaError(error) }
  }
}

export async function deleteGymAction(id: string) {
  try {
    const ctx = await requireSuperAdmin()

    const gym = await prisma.organization.findUnique({ where: { id }, select: { name: true, slug: true } })

    await prisma.organization.delete({ where: { id } })

    await audit(ctx.userId, AuditAction.ORG_DELETE, {
      targetType: "Organization",
      targetId: id,
      metadata: { name: gym?.name, slug: gym?.slug }
    })

    revalidatePath("/admin")
    return { success: true }
  } catch (error: any) {
    if (error instanceof AuthError) return { error: error.message }
    console.error("Error deleting gym:", error)
    return { error: handlePrismaError(error) }
  }
}
