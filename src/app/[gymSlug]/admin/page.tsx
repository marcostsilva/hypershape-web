import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { 
  Users, 
  Dumbbell, 
  TrendingUp, 
  Clock,
  ArrowRight,
  PlusCircle,
  Building2
} from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage(props: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await props.params
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Buscar academia para garantir que o slug é válido
  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      _count: {
        select: { users: true, workouts: true }
      }
    }
  })

  if (!gym) {
    redirect("/")
  }

  // Estatísticas rápidas
  const totalStudents = await prisma.user.count({
    where: { 
      gymId: gym.id,
      role: 'MEMBER'
    }
  })

  const totalTemplates = await prisma.workout.count({
    where: { 
      gymId: gym.id,
      isTemplate: true
    }
  })

  const recentStudents = await prisma.user.findMany({
    where: { gymId: gym.id, role: 'MEMBER' },
    orderBy: { createdAt: 'desc' },
    take: 5
  })

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href={`/${gymSlug}/dashboard`}
              className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors"
            >
              <ArrowRight className="w-3 h-3 rotate-180" />
              Voltar ao App
            </Link>
          </div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
            Dashboard <span className="text-primary">{gym.name}</span>
          </h1>
          <p className="text-zinc-400 mt-1">Bem-vindo ao painel administrativo da sua academia.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            href={`/${gymSlug}/admin/details`}
            className="bg-white/5 text-white border border-white/10 font-bold px-4 py-2 rounded-lg hover:bg-white/10 transition-all flex items-center gap-2 text-sm"
          >
            <Building2 className="w-4 h-4" />
            Dados da Unidade
          </Link>
          <Link 
            href={`/${gymSlug}/admin/students/new`}
            className="bg-primary text-black font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Novo Aluno
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <span className="text-xs font-bold text-blue-500 uppercase tracking-wider">Alunos</span>
          </div>
          <div className="text-3xl font-black text-white">{totalStudents}</div>
          <p className="text-zinc-500 text-sm mt-1">Alunos ativos no sistema</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Dumbbell className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Treinos</span>
          </div>
          <div className="text-3xl font-black text-white">{totalTemplates}</div>
          <p className="text-zinc-500 text-sm mt-1">Modelos de treino prescritos</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
            </div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Engajamento</span>
          </div>
          <div className="text-3xl font-black text-white">--</div>
          <p className="text-zinc-500 text-sm mt-1">Taxa de conclusão de treinos</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Students */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md">
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-zinc-400" />
              Alunos Recentes
            </h2>
            <Link href={`/${gymSlug}/admin/students`} className="text-primary text-xs font-bold uppercase hover:underline flex items-center gap-1">
              Ver todos
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentStudents.length > 0 ? (
              recentStudents.map((student) => (
                <Link 
                  key={student.id} 
                  href={`/${gymSlug}/admin/students/${student.id}`}
                  className="flex items-center gap-4 p-6 hover:bg-white/5 transition-all group"
                >
                  <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center text-white font-bold group-hover:bg-primary group-hover:text-black transition-all">
                    {student.name?.[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate">{student.name}</p>
                    <p className="text-zinc-500 text-xs truncate">{student.email}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
                </Link>
              ))
            ) : (
              <div className="p-12 text-center text-zinc-500 italic">
                Nenhum aluno cadastrado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Info */}
        <div className="space-y-6">
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 text-primary/10">
              <Dumbbell className="w-40 h-40" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl font-black text-white mb-2">Prescrever Treinos</h2>
              <p className="text-zinc-400 text-sm mb-6 max-w-[300px]">
                Crie rotinas personalizadas para seus alunos e acompanhe o progresso deles em tempo real.
              </p>
              <Link 
                href={`/${gymSlug}/admin/students`}
                className="inline-flex items-center gap-2 bg-primary text-black font-bold px-6 py-3 rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
              >
                Começar Prescrição
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <h3 className="text-white font-bold mb-4">Informações da Academia</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">CNPJ</span>
                <span className="text-zinc-300 font-mono">{gym.cnpj || "Não cadastrado"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Plano Atual</span>
                <span className="text-primary font-bold">{gym.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Domínio Customizado</span>
                <span className="text-zinc-300">{gym.customDomain || 'Não configurado'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Membros Totais</span>
                <span className="text-zinc-300">{gym._count.users} / {gym.studentLimit}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
