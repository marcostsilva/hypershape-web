import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { FileText, Download, Filter, Calendar, TrendingUp, Users, Building2 } from "lucide-react"

export default async function GlobalReportsPage() {
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    redirect("/")
  }

  const reports = [
    { title: "Faturamento Mensal Consolidado", description: "Resumo de todas as assinaturas e planos ativos.", date: "Abril 2026", type: "Financeiro" },
    { title: "Relatório de Crescimento de Usuários", description: "Análise de novos cadastros vs cancelamentos (Churn).", date: "Q1 2026", type: "Crescimento" },
    { title: "Uso de Recursos por Unidade", description: "Monitoramento de limite de alunos e armazenamento.", date: "Março 2026", type: "Operacional" },
    { title: "Engajamento Global (Workouts)", description: "Volume de treinos realizados em toda a rede.", date: "Abril 2026", type: "Engajamento" },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Relatórios <span className="text-primary">Executivos</span></h1>
          <p className="text-zinc-400 mt-1">Gere e exporte documentos para tomada de decisão estratégica.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-zinc-900 border border-white/10 px-4 py-2 rounded-xl text-zinc-400 hover:text-white transition-all flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4" /> Filtrar Período
          </button>
          <button className="bg-primary text-black font-black px-4 py-2 rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Exportar Tudo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 hover:border-primary/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
              <FileText className="w-24 h-24" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded">{report.type}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {report.date}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
              <p className="text-zinc-500 text-sm mb-6 max-w-sm">{report.description}</p>
              
              <div className="flex items-center gap-3">
                <button className="text-xs font-black uppercase text-primary hover:underline flex items-center gap-1">
                  Gerar PDF <Download className="w-3 h-3" />
                </button>
                <div className="w-px h-3 bg-zinc-800" />
                <button className="text-xs font-black uppercase text-zinc-400 hover:text-white transition-colors">
                  Visualizar Online
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stats Summary for Reports */}
      <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Projeção de Performance Q2
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span className="text-zinc-500">Novas Academias</span>
              <span className="text-primary">+15%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: '65%' }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span className="text-zinc-500">Retenção de Usuários</span>
              <span className="text-blue-500">92%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500" style={{ width: '92%' }} />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase">
              <span className="text-zinc-500">Engajamento de Treino</span>
              <span className="text-emerald-500">+24%</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: '78%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
