import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BarChart3, TrendingUp, Users, Building2, Activity, Globe, Zap } from "lucide-react"

export default async function GlobalStatsPage() {
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    redirect("/")
  }

  const [gymCount, userCount, workoutCount] = await Promise.all([
    prisma.gym.count(),
    prisma.user.count(),
    prisma.workout.count(),
  ])

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Analytics <span className="text-primary">Global</span></h1>
        <p className="text-zinc-400 mt-1 text-sm">Dados consolidados de performance técnica e operacional da rede.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 group">
          <Globe className="w-6 h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Cidades Atendidas</p>
          <div className="text-4xl font-black text-white">12</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 group">
          <Activity className="w-6 h-6 text-emerald-500 mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Tempo de Uptime</p>
          <div className="text-4xl font-black text-white">99.9%</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 group">
          <Zap className="w-6 h-6 text-amber-500 mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Latência Média</p>
          <div className="text-4xl font-black text-white">45ms</div>
        </div>
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 group">
          <TrendingUp className="w-6 h-6 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-1">Taxa de Crescimento</p>
          <div className="text-4xl font-black text-white">+8.4%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-[400px] flex flex-col items-center justify-center text-center space-y-4">
          <BarChart3 className="w-12 h-12 text-zinc-800" />
          <div>
            <h3 className="text-white font-bold">Volume de Treinos Mensal</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2 italic">Aguardando processamento do pipeline de BI para visualização de série histórica.</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 h-[400px] flex flex-col items-center justify-center text-center space-y-4">
          <Users className="w-12 h-12 text-zinc-800" />
          <div>
            <h3 className="text-white font-bold">Distribuição de Usuários</h3>
            <p className="text-zinc-500 text-sm max-w-xs mx-auto mt-2 italic">Mapa de calor e densidade populacional por unidade HyperShape em breve.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
