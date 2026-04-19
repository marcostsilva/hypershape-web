import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { FileText, Download, TrendingUp, Users, Clock, Dumbbell } from "lucide-react"

export default async function GymReportsPage({
  params,
}: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()
  
  if (!session?.user) redirect("/login")

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug }
  })

  if (!gym) redirect("/")

  const reports = [
    { title: "Frequência Mensal de Alunos", description: "Relatório detalhado de acessos e horários de pico.", icon: Users },
    { title: "Produtividade de Treinos", description: "Quais modelos de treino são mais realizados e eficientes.", icon: Dumbbell },
    { title: "Retenção e Churn (Local)", description: "Taxa de permanência e motivos de saída de alunos.", icon: TrendingUp },
    { title: "Métricas de Evolução Corporal", description: "Consolidado de medidas e peso de toda a unidade.", icon: Clock },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Centro de <span className="text-primary">Relatórios</span></h1>
        <p className="text-zinc-400 mt-1">Dados específicos da unidade {gym.name} para gestão operacional.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 hover:border-primary/50 transition-all group flex items-start gap-6">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
              <report.icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">{report.title}</h3>
              <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{report.description}</p>
              <button className="flex items-center gap-2 text-xs font-black uppercase text-primary hover:underline">
                Gerar Relatório <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-10 text-center">
        <FileText className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
        <h3 className="text-white font-bold mb-2">Configurar Relatórios Automáticos</h3>
        <p className="text-zinc-500 text-sm mb-6 max-w-sm mx-auto">
          Receba relatórios semanais de performance diretamente no seu e-mail cadastrado.
        </p>
        <button className="px-8 py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all">
          Ativar Automação
        </button>
      </div>
    </div>
  )
}
