import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Dumbbell, Plus, Search, Filter } from "lucide-react"

export default async function AdminWorkoutsPage({
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

  const templates = await prisma.workout.findMany({
    where: {
      organizationId: gym.id,
      isTemplate: true
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Treinos & <span className="text-primary">Planilhas</span>
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">Gerencie os modelos de treino e rotinas da unidade.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Buscar treino..."
              className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-full md:w-64 focus:outline-none focus:border-primary/50 transition-all"
            />
          </div>
          <button 
            className="bg-primary text-black font-black px-6 py-2.5 rounded-xl hover:scale-105 transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/20"
          >
            <Plus className="w-4 h-4" />
            Novo Template
          </button>
        </div>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/5">
          <Dumbbell className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
          <p className="text-zinc-500 font-medium">Nenhum template de treino criado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 hover:border-primary/30 transition-all group backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">{new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{template.name}</h3>
                <p className="text-zinc-500 text-xs mt-2">{(template.exercises as any)?.length || 0} exercícios cadastrados</p>
              </div>
              <div className="mt-6 flex gap-2">
                <button className="flex-1 py-2 bg-white/5 text-white text-xs font-bold rounded-lg hover:bg-white/10 transition-all border border-white/5">
                  Editar
                </button>
                <button className="px-3 py-2 bg-white/5 text-zinc-400 text-xs font-bold rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/5">
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
