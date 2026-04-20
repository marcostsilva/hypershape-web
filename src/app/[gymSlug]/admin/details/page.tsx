import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BrandingForm } from "./branding-form"
import { ArrowLeft, Building2, User, MapPin, CreditCard, Users, MessageSquare, Globe } from "lucide-react"

export default async function GymDetailsPage({
  params,
}: {
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      _count: {
        select: { users: true }
      }
    }
  })

  if (!gym) redirect("/")

  // Verificar se o usuário é ADMIN desta academia
  if ((session.user as any).role !== "ADMIN" || (session.user as any).gymId !== gym.id) {
    // Permitir se for Super Admin (gymId null e role ADMIN)
    if (!(!(session.user as any).gymId && (session.user as any).role === "ADMIN")) {
      redirect(`/${gymSlug}/dashboard`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href={`/${gymSlug}/admin`}
          className="text-zinc-500 hover:text-white flex items-center gap-1 text-xs font-bold transition-colors w-fit"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar ao Painel
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
              Dados da <span className="text-primary">Academia</span>
            </h1>
            <p className="text-zinc-400 mt-1">Informações de contrato e fiscais da unidade.</p>
          </div>
          <div className="px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
            <span className="text-primary text-xs font-bold uppercase tracking-widest">{gym.plan}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identificação */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Identificação</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">Nome Fantasia</p>
              <p className="text-white font-medium">{gym.name}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">Razão Social</p>
              <p className="text-white font-medium">{gym.corporateName || "-"}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">CNPJ</p>
              <p className="text-white font-mono">{gym.cnpj || "-"}</p>
            </div>
          </div>
        </div>

        {/* Responsável e Endereço */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Responsável & Local</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-zinc-500 text-xs uppercase font-bold">E-mail do Responsável</p>
              <p className="text-white font-medium">{gym.ownerEmail || "-"}</p>
            </div>
            <div className="flex gap-2 items-start">
              <MapPin className="w-4 h-4 text-zinc-500 mt-1" />
              <div>
                <p className="text-zinc-500 text-xs uppercase font-bold">Endereço</p>
                <p className="text-white text-sm leading-relaxed">
                  {gym.street ? (
                    <>
                      {gym.street}, {gym.number} {gym.complement && `- ${gym.complement}`} <br />
                      {gym.neighborhood} - {gym.city}/{gym.state} <br />
                      CEP: {gym.zipCode}
                    </>
                  ) : "Não informado"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plano e Assinatura */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Plano & Assinatura</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-zinc-500 text-xs uppercase font-bold">Plano Contratado</p>
                <p className="text-white font-black text-xl">{gym.plan}</p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-xs uppercase font-bold">Capacidade</p>
                <div className="flex items-center gap-2 text-white">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-bold">{gym.maxStudents} alunos</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-zinc-500 text-xs mb-3 italic">
                Para alterar seu plano ou atualizar dados fiscais, entre em contato com nossa equipe central.
              </p>
              <a 
                href={`mailto:suporte@hypershape.com?subject=Alteração de Dados - ${gym.name}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                Entrar em Contato
              </a>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center gap-3 text-white border-b border-white/5 pb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="font-bold">Uso do Sistema</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold uppercase">
                <span className="text-zinc-500">Ocupação de Alunos</span>
                <span className="text-white">{gym._count.users} / {gym.maxStudents}</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${Math.min((gym._count.users / gym.maxStudents) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Sua academia está utilizando <span className="text-white font-bold">{Math.round((gym._count.users / gym.maxStudents) * 100)}%</span> da capacidade do plano atual.
              </p>
            </div>
          </div>
        </div>

        {/* Customização de Marca (White-label) */}
        <BrandingForm 
          gymId={gym.id}
          gymSlug={gymSlug}
          initialPrimary={gym.primaryColor}
          initialSecondary={gym.secondaryColor}
          initialLogo={gym.logoUrl}
        />
      </div>
    </div>
  )
}
