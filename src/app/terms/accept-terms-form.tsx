"use client"

import { useTransition } from "react"
import { acceptTermsAction } from "./actions"
import { Check, Loader2 } from "lucide-react"

export function AcceptTermsForm() {
  const [isPending, startTransition] = useTransition()

  function handleAccept() {
    startTransition(() => {
      acceptTermsAction()
    })
  }

  return (
    <div className="space-y-4">
      <button
        onClick={handleAccept}
        disabled={isPending}
        className="w-full bg-primary text-black font-bold py-4 rounded-xl hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary/20"
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Li e aceito os Termos de Uso e Privacidade
          </>
        )}
      </button>
      <p className="text-center text-[10px] text-zinc-600 uppercase tracking-widest">
        Ao aceitar, você concorda com o processamento dos seus dados conforme descrito acima.
      </p>
    </div>
  )
}
