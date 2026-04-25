import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { 
  Building2, 
  Users, 
  Settings, 
  Plus,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Activity,
  CreditCard
} from "lucide-react"
import Link from "next/link"

export default async function SuperAdminDashboardPage() {
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).organizationId) {
    redirect("/")
  }

  const [totalGyms, totalUsers, totalWorkouts, recentGyms] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.workout.count(),
    prisma.organization.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { memberships: true }
        }
      }
    })
  ])

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest">Painel de Controle Central</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-white">
            COCKPIT <span className="text-primary">GLOBAL</span>
          </h1>
          <p className="text-zinc-500 mt-2 text-sm max-w-lg">
            Monitoramento em tempo real do ecossistema HyperShape. Gerencie unidades, valide contratos e analise o crescimento global.
          </p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/gyms/new"
            className="bg-primary text-black font-black px-6 py-3 rounded-2xl hover:scale-105 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Nova Academia
          </Link>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-primary/10 transition-colors">
            <Building2 className="w-32 h-32" />
          </div>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Unidades</p>
          <div className="text-4xl font-black text-white">{totalGyms}</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase">
            <Activity className="w-3 h-3" /> Sistema Nominal
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-blue-500/10 transition-colors">
            <Users className="w-32 h-32" />
          </div>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Ecossistema</p>
          <div className="text-4xl font-black text-white">{totalUsers}</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-blue-500 font-black uppercase">
            <TrendingUp className="w-3 h-3" /> Crescimento Ativo
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-amber-500/10 transition-colors">
            <Settings className="w-32 h-32" />
          </div>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">Processamento</p>
          <div className="text-4xl font-black text-white">{totalWorkouts}</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-500 font-black uppercase">
            Treinos Sincronizados
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-emerald-500/10 transition-colors">
            <CreditCard className="w-32 h-32" />
          </div>
          <p className="text-zinc-500 text-xs font-black uppercase tracking-widest mb-1">MRR (Simulado)</p>
          <div className="text-4xl font-black text-white">R$ 14k</div>
          <div className="mt-4 flex items-center gap-2 text-[10px] text-emerald-500 font-black uppercase">
            Faturamento Mensal
          </div>
        </div>
      </div>

      {/* Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-zinc-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-primary" />
              Últimas Academias
            </h2>
            <Link href="/admin/gyms" className="text-primary text-xs font-black uppercase hover:underline flex items-center gap-1">
              Ver Todas
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentGyms.map((gym) => (
              <div key={gym.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-white border border-white/5">
                    {gym.name[0]}
                  </div>
                  <div>
                    <p className="text-white font-bold">{gym.name}</p>
                    <p className="text-zinc-500 text-xs">{gym._count.memberships} alunos • {gym.plan}</p>
                  </div>
                </div>
                <Link 
                  href={`/admin/gyms/${gym.id}`}
                  className="p-2 text-zinc-600 hover:text-primary transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* System Health / Alertas */}
        <div className="space-y-6">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8">
            <h3 className="text-amber-500 font-black text-lg mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Alertas do Sistema
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-black/40 rounded-2xl border border-amber-500/10">
                <p className="text-amber-200 text-xs font-bold mb-1 uppercase">Contrato Expirando</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  A unidade <span className="text-white font-bold">Gold Gym SJC</span> possui faturas em atraso.
                </p>
              </div>
              <div className="p-4 bg-black/40 rounded-2xl border border-amber-500/10">
                <p className="text-amber-200 text-xs font-bold mb-1 uppercase">Limite de Alunos</p>
                <p className="text-zinc-400 text-xs leading-relaxed">
                  3 unidades atingiram 90% da capacidade do plano Basic.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-8">
            <h3 className="text-white font-black text-lg mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/users" className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center hover:border-primary/50 transition-all group">
                <Users className="w-5 h-5 text-zinc-500 mx-auto mb-2 group-hover:text-primary" />
                <span className="text-xs text-zinc-400 font-bold uppercase">Usuários</span>
              </Link>
              <Link href="/admin/reports" className="p-4 bg-black/40 rounded-2xl border border-white/5 text-center hover:border-primary/50 transition-all group">
                <FileText className="w-5 h-5 text-zinc-500 mx-auto mb-2 group-hover:text-primary" />
                <span className="text-xs text-zinc-400 font-bold uppercase">Relatórios</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { FileText } from "lucide-react"
