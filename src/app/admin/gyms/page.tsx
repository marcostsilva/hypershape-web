import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Building2, Plus, ArrowRight, Settings, Search } from "lucide-react"
import Link from "next/link"

export default async function AdminGymsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  const session = await auth()
  const { page, q } = await searchParams
  const currentPage = Number(page) || 1
  const pageSize = 10
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    redirect("/")
  }

  const [totalGyms, gyms] = await Promise.all([
    prisma.gym.count({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : {}
    }),
    prisma.gym.findMany({
      where: q ? { name: { contains: q, mode: 'insensitive' } } : {},
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
      include: {
        _count: {
          select: { users: true, workouts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ])

  const totalPages = Math.ceil(totalGyms / pageSize)

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Gestão de <span className="text-primary">Academias</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Controle de unidades, planos e limites operacionais.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar unidade..."
              className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-full md:w-64 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <Link 
            href="/admin/gyms/new"
            className="bg-primary text-black font-bold px-6 py-2.5 rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Nova Unidade
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {gyms.map((gym) => (
          <div key={gym.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all flex items-center justify-between group backdrop-blur-sm">
            <div className="flex items-center gap-5 flex-1">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl flex items-center justify-center text-primary font-black text-xl border border-white/5 group-hover:border-primary/50 transition-colors">
                {gym.name[0]}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 flex-1">
                <div className="md:col-span-1">
                  <Link 
                    href={`/admin/gyms/${gym.id}`}
                    className="text-lg font-bold text-white hover:text-primary transition-colors block leading-tight"
                  >
                    {gym.name}
                  </Link>
                  <p className="text-zinc-500 text-xs mt-1 italic tracking-tight">/{gym.slug}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">CNPJ</p>
                  <p className="text-sm font-mono text-zinc-300">{gym.cnpj || "Não cadastrado"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">Plano & Limite</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-primary">{gym.plan}</span>
                    <span className="text-zinc-600 text-xs">/</span>
                    <span className="text-xs text-white">{gym._count.users} de {gym.maxStudents}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-tighter mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-500 font-bold">Ativa</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Link 
                href={`/admin/gyms/${gym.id}`}
                className="p-3 bg-white/5 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                title="Configurações ERP"
              >
                <Settings className="w-5 h-5" />
              </Link>
              <Link 
                href={`/${gym.slug}/admin`}
                className="p-3 bg-primary/10 rounded-xl text-primary hover:bg-primary hover:text-black transition-all border border-primary/20"
                title="Assumir Controle Local"
              >
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        ))}
        {gyms.length === 0 && (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5">
            <Building2 className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 font-medium">Nenhuma academia encontrada com os critérios.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <Link
              key={i}
              href={`/admin/gyms?page=${i + 1}`}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                currentPage === i + 1 
                  ? "bg-primary text-black" 
                  : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800 hover:text-white border border-white/5"
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
