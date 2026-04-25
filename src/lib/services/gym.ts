import prisma from "@/lib/prisma"

/**
 * Valida se a academia tem capacidade para adicionar um novo aluno baseado no seu plano.
 * @param organizationId ID da academia
 * @throws Error se o limite for atingido ou a academia não existir
 */
export async function validateGymCapacity(organizationId: string) {
  const gym = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: {
      maxStudents: true,
      _count: {
        select: { memberships: true }
      }
    }
  })

  if (!gym) {
    throw new Error("Academia não encontrada.")
  }

  if (gym._count.memberships >= gym.maxStudents) {
    throw new Error(`Limite de alunos atingido (${gym.maxStudents}). Por favor, faça um upgrade de plano.`)
  }
  
  return true
}
