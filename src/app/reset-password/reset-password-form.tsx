"use client"

import { useActionState } from "react"
import { resetPasswordAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, KeyRound, CheckCircle2 } from "lucide-react"

interface ResetPasswordFormProps {
  token: string
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [state, formAction, isPending] = useActionState(resetPasswordAction, null)

  return (
    <div className="w-full max-w-md">
      <div className="flex flex-col items-center mb-8">
        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center mb-4 border border-primary/30">
          <KeyRound className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Nova Senha</h1>
        <p className="text-zinc-400 mt-2 text-center text-sm">
          Defina sua nova senha de acesso abaixo.
        </p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl">
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Nova Senha</Label>
            <Input
              type="password"
              name="password"
              required
              placeholder="Mínimo 6 caracteres"
              disabled={isPending}
              className="bg-black/50 border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all h-12"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-zinc-400 uppercase tracking-wider ml-1">Confirmar Senha</Label>
            <Input
              type="password"
              name="confirmPassword"
              required
              placeholder="Repita a nova senha"
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
                Alterar Senha
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
