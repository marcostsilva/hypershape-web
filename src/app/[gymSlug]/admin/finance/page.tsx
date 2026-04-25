import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { CreditCard, ArrowUpRight, ArrowDownRight, History, Download } from "lucide-react"

export default async function FinancePage({
  params,
}: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()
  
  if (!session?.user) redirect("/login")

  const gym = await prisma.organization.findUnique({
    where: { slug: gymSlug }
  })

  if (!gym) redirect("/")

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Gestão <span className="text-primary">Financeira</span></h1>
        <p className="text-zinc-400 mt-1">Acompanhe seus contratos, mensalidades e faturamento.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Mensalidade HyperShape</p>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-black text-white">R$ 299,00</div>
            <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase">Pago</div>
          </div>
          <p className="text-zinc-500 text-xs mt-4 italic">Próximo vencimento: 15/05/2026</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Plano Atual</p>
          <div className="text-2xl font-black text-primary uppercase">{gym.plan}</div>
          <p className="text-zinc-500 text-xs mt-4 italic">Limite de {gym.maxStudents} alunos</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Receita Alunos (Est.)</p>
          <div className="text-2xl font-black text-white">R$ 12.450,00</div>
          <p className="text-zinc-500 text-xs mt-4 flex items-center gap-1 text-emerald-500">
            <ArrowUpRight className="w-3 h-3" /> +12% este mês
          </p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-zinc-500" />
            Histórico de Faturas
          </h2>
        </div>
        <div className="divide-y divide-white/5">
          {[
            { date: "15/04/2026", amount: "R$ 299,00", status: "Pago", id: "INV-2026-001" },
            { date: "15/03/2026", amount: "R$ 299,00", status: "Pago", id: "INV-2026-002" },
            { date: "15/02/2026", amount: "R$ 149,50", status: "Pago", id: "INV-2026-003" },
          ].map((invoice) => (
            <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{invoice.id}</p>
                  <p className="text-zinc-500 text-xs">{invoice.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-sm">{invoice.amount}</p>
                <p className="text-emerald-500 text-[10px] font-bold uppercase">{invoice.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
