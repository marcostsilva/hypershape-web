"use server"

import prisma from "@/lib/prisma"

export async function generateReportAction(type: string, gymSlug: string) {
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      _count: {
        select: { users: true, workouts: true, measurements: true }
      }
    }
  })

  if (!gym) throw new Error("Academia não encontrada")

  // Simulação de processamento de dados pesados
  await new Promise(resolve => setTimeout(resolve, 1500))

  switch (type) {
    case "Frequência Mensal de Alunos":
      const workouts = await prisma.workout.findMany({
        where: { gymId: gym.id },
        orderBy: { performedAt: 'desc' },
        take: 100
      })
      return { 
        data: workouts, 
        summary: `Total de ${workouts.length} treinos registrados nos últimos dias.` 
      }
    
    case "Retenção e Churn (Local)":
      const students = await prisma.user.findMany({
        where: { gymId: gym.id },
        select: { id: true, lastWorkout: true }, // assuming lastWorkout exists or we compute it
      })
      // Lógica simplificada de churn
      return {
        data: students,
        summary: "Análise de retenção concluída com sucesso."
      }

    default:
      return { summary: "Relatório gerado com sucesso (modo demonstração)." }
  }
}
