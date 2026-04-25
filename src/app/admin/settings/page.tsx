import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Settings, Shield, Bell, CreditCard, Database, Globe } from "lucide-react"

export default async function AdminSettingsPage() {
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).organizationId) {
    redirect("/login")
  }

  const sections = [
    {
      title: "Geral",
      icon: Globe,
      description: "Configurações globais de fuso horário, idioma e manutenção.",
      items: ["Fuso Horário: UTC-3", "Idioma: Português (BR)", "Modo Manutenção: Desativado"]
    },
    {
      title: "Segurança",
      icon: Shield,
      description: "Políticas de senha, autenticação de dois fatores e sessões.",
      items: ["2FA Obrigatório: Não", "Expiração de Sessão: 24h"]
    },
    {
      title: "Pagamentos (ERP)",
      icon: CreditCard,
      description: "Configuração de gateways para recebimento das academias.",
      items: ["Gateway: Stripe (Live)", "Moeda: BRL"]
    },
    {
      title: "Notificações",
      icon: Bell,
      description: "Alertas de sistema e e-mails transacionais.",
      items: ["E-mail: Resend", "Logs de Erro: Ativado"]
    }
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Configurações <span className="text-primary">Globais</span></h1>
        <p className="text-zinc-400 mt-1">Gestão centralizada dos parâmetros do ecossistema HyperShape.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, i) => (
          <div key={i} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 hover:border-primary/20 transition-all group">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <section.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{section.title}</h3>
                <p className="text-zinc-500 text-xs">{section.description}</p>
              </div>
            </div>
            
            <ul className="space-y-3">
              {section.items.map((item, j) => (
                <li key={j} className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">{item.split(":")[0]}</span>
                  <span className="text-white font-bold">{item.split(":")[1]}</span>
                </li>
              ))}
            </ul>

            <button className="w-full mt-8 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-xs font-black uppercase hover:bg-white/10 transition-all">
              Configurar {section.title}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Database className="w-8 h-8 text-red-500" />
          <div>
            <h4 className="text-red-500 font-bold">Zona de Perigo</h4>
            <p className="text-zinc-500 text-xs mt-1">Ações que afetam permanentemente a integridade dos dados globais.</p>
          </div>
        </div>
        <button className="px-6 py-2 bg-red-500 text-white text-xs font-black rounded-lg hover:bg-red-600 transition-all">
          Limpar Cache Global
        </button>
      </div>
    </div>
  )
}
