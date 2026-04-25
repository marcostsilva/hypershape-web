import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users, Dumbbell, TrendingUp, Calendar, Clock } from "lucide-react"

export default async function StatsPage({
  params,
}: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()
  
  if (!session?.user) redirect("/login")

  const gym = await prisma.organization.findUnique({
    where: { slug: gymSlug },
    include: {
      _count: {
        select: { memberships: true, workouts: true }
      }
    }
  })

  if (!gym) redirect("/")

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Estatísticas <span className="text-primary">Operacionais</span></h1>
        <p className="text-zinc-400 mt-1">Análise de engajamento e crescimento da unidade.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <Users className="w-5 h-5 text-primary mb-4" />
          <p className="text-zinc-500 text-xs font-bold uppercase">Total Alunos</p>
          <div className="text-3xl font-black text-white">{gym._count.memberships}</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <Dumbbell className="w-5 h-5 text-emerald-500 mb-4" />
          <p className="text-zinc-500 text-xs font-bold uppercase">Treinos Realizados</p>
          <div className="text-3xl font-black text-white">{gym._count.workouts}</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <Clock className="w-5 h-5 text-blue-500 mb-4" />
          <p className="text-zinc-500 text-xs font-bold uppercase">Média Presença</p>
          <div className="text-3xl font-black text-white">3.2 / sem</div>
        </div>
        <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
          <TrendingUp className="w-5 h-5 text-amber-500 mb-4" />
          <p className="text-zinc-500 text-xs font-bold uppercase">Churn Rate</p>
          <div className="text-3xl font-black text-white">1.8%</div>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 h-[400px] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-500 italic">Gráficos interativos em fase de processamento de dados...</p>
        </div>
      </div>
    </div>
  )
}

import { BarChart3 } from "lucide-react"
