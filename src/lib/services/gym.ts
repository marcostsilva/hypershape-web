import prisma from "@/lib/prisma"

/**
 * Valida se a academia tem capacidade para adicionar um novo aluno baseado no seu plano.
 * @param gymId ID da academia
 * @throws Error se o limite for atingido ou a academia não existir
 */
export async function validateGymCapacity(gymId: string) {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      maxStudents: true,
      _count: {
        select: { users: true }
      }
    }
  })

  if (!gym) {
    throw new Error("Academia não encontrada.")
  }

  if (gym._count.users >= gym.maxStudents) {
    throw new Error(`Limite de alunos atingido (${gym.maxStudents}). Por favor, faça um upgrade de plano.`)
  }
  
  return true
}
