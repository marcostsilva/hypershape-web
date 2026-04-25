import { auth } from "@/auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { AcceptTermsForm } from "./accept-terms-form"
import { CURRENT_PRIVACY_VERSION } from "@/lib/constants"
import { Shield, FileText, Lock, Trash2, Eye } from "lucide-react"

export default async function TermsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  // Se já aceitou a versão atual, redirecionar
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { acceptedTermsAt: true, privacyVersion: true }
  })

  if (user?.privacyVersion === CURRENT_PRIVACY_VERSION) {
    const sessionUser = session.user as any
    if (sessionUser.gymSlug) {
      redirect(`/${sessionUser.gymSlug}/dashboard`)
    }
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl border border-primary/20 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
            Termos de Uso e <span className="text-primary">Privacidade</span>
          </h1>
          <p className="text-zinc-400 text-sm max-w-md mx-auto">
            Para continuar utilizando o HyperShape, é necessário aceitar nossos termos atualizados.
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
              Versão {CURRENT_PRIVACY_VERSION}
            </span>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md space-y-6 max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700">
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <FileText className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">1. Coleta de Dados</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              O HyperShape coleta e processa dados pessoais necessários para a prestação do serviço, 
              incluindo: nome, e-mail, dados de treinos, medidas corporais e informações de saúde. 
              Esses dados são utilizados exclusivamente para fornecer e melhorar a experiência do usuário 
              na plataforma.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Lock className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">2. Proteção e Armazenamento</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Seus dados são armazenados em servidores seguros com criptografia em trânsito e em repouso. 
              O acesso é controlado por autenticação multi-camada e isolamento de tenant, garantindo que 
              dados de diferentes organizações nunca se misturem.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Eye className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">3. Compartilhamento</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Se você for um aluno gerenciado por uma academia, seus dados de treino e medidas serão 
              visíveis para os coaches e administradores da sua unidade. Nunca compartilhamos dados 
              com terceiros para fins comerciais.
            </p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Trash2 className="w-4 h-4 text-primary" />
              <h2 className="font-bold text-sm">4. Seus Direitos (LGPD)</h2>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Conforme a Lei Geral de Proteção de Dados (LGPD), você tem direito a:
            </p>
            <ul className="text-zinc-400 text-sm space-y-1 pl-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-zinc-300">Acesso:</strong> Solicitar uma cópia de todos os seus dados armazenados.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-zinc-300">Correção:</strong> Atualizar dados incorretos ou incompletos.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-zinc-300">Exclusão:</strong> Solicitar a remoção completa dos seus dados pessoais.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong className="text-zinc-300">Portabilidade:</strong> Exportar seus dados em formato legível por máquina.</span>
              </li>
            </ul>
          </section>
        </div>

        {/* Accept Form */}
        <AcceptTermsForm />
      </div>
    </div>
  )
}
