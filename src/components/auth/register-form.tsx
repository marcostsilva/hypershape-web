"use client"

import { useActionState } from "react"
import { registerAction } from "@/app/register/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowRight } from "lucide-react"

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Nome</Label>
        <Input
          name="name"
          required
          placeholder="Seu nome"
          disabled={isPending}
          className="bg-black/50 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-12"
        />
      </div>
      
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Email</Label>
        <Input
          type="email"
          name="email"
          required
          placeholder="seu@email.com"
          disabled={isPending}
          className="bg-black/50 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-12"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Senha</Label>
        <Input
          type="password"
          name="password"
          required
          placeholder="Mínimo 6 caracteres"
          disabled={isPending}
          className="bg-black/50 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-12"
        />
      </div>

      {state?.error && (
        <div className="text-sm text-destructive text-center font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-lg animate-in slide-in-from-top-2">
          {state.error}
        </div>
      )}

      <Button
        disabled={isPending}
        type="submit"
        className="w-full bg-primary text-black font-bold rounded-lg px-4 py-3 mt-2 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 h-12"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Criar Conta
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </form>
  )
}
