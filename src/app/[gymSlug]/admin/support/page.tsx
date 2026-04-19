import { auth } from "@/auth"
import { HelpCircle, MessageSquare, Mail, Phone, ExternalLink } from "lucide-react"

export default async function SupportPage() {
  const session = await auth()
  
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Central de <span className="text-primary">Suporte</span></h1>
        <p className="text-zinc-400 mt-1">Estamos aqui para ajudar você a gerir sua academia da melhor forma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-primary/50 transition-all group">
          <MessageSquare className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold text-white mb-2">Chat em Tempo Real</h2>
          <p className="text-zinc-500 text-sm mb-6">Fale com nossos consultores agora mesmo para resolver dúvidas técnicas ou operacionais.</p>
          <button className="w-full py-3 bg-primary text-black font-black rounded-xl hover:bg-primary/90 transition-all">
            Abrir Chat
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-blue-500/50 transition-all group">
          <Mail className="w-10 h-10 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
          <h2 className="text-xl font-bold text-white mb-2">E-mail de Suporte</h2>
          <p className="text-zinc-500 text-sm mb-6">Envie solicitações formais, sugestões de melhoria ou problemas complexos.</p>
          <a 
            href="mailto:suporte@hypershape.com"
            className="flex items-center justify-center w-full py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
          >
            suporte@hypershape.com
          </a>
        </div>
      </div>

      <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-8">
        <h3 className="text-white font-bold mb-6 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-zinc-500" />
          Perguntas Frequentes
        </h3>
        <div className="space-y-4">
          {[
            "Como cadastrar um novo personal trainer?",
            "Como exportar relatórios mensais em PDF?",
            "Como configurar o domínio customizado da minha academia?",
            "Como gerenciar inadimplência de alunos?"
          ].map((q, i) => (
            <div key={i} className="p-4 bg-black/40 rounded-xl border border-white/5 flex items-center justify-between group cursor-pointer hover:border-white/20">
              <span className="text-zinc-400 text-sm group-hover:text-white transition-colors">{q}</span>
              <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
