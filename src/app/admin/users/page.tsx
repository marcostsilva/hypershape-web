import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Users, UserCog, Shield, Search, MoreVertical, Ban } from "lucide-react"

export default async function GlobalUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth()
  const { q } = await searchParams
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    redirect("/")
  }

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    } : {},
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      gym: { select: { name: true } }
    }
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">Usuários <span className="text-primary">Globais</span></h1>
          <p className="text-zinc-400 mt-1">Gestão de todas as contas cadastradas na plataforma.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou e-mail..."
            className="bg-zinc-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white w-full md:w-64 focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <th className="px-6 py-4">Usuário</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Função</th>
              <th className="px-6 py-4">Academia</th>
              <th className="px-6 py-4">Cadastro</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user.name?.[0] || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{user.name || "Sem nome"}</p>
                      <p className="text-xs text-zinc-500">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {user.isBlocked ? (
                    <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold rounded">Bloqueado</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded">Ativo</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-zinc-300 text-xs">
                    <Shield className="w-3 h-3 text-primary" />
                    {user.role}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-zinc-400">{user.gym?.name || "Independente"}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-zinc-500">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
                </td>
                <td className="px-6 py-4">
                  <button className="p-2 text-zinc-600 hover:text-white transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
