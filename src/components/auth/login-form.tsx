"use client"

import { useActionState } from "react"
import { loginWithCredentialsAction, loginWithGoogleAction } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

import { useSearchParams } from "next/navigation"

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginWithCredentialsAction, null)
  const searchParams = useSearchParams()
  const success = searchParams.get("success")

  return (
    <div className="grid gap-6 w-full">
      {success === "password_reset" && (
        <div className="text-sm text-emerald-400 text-center font-medium bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
          Senha alterada com sucesso! Faça login agora.
        </div>
      )}
      {success === "registered" && (
        <div className="text-sm text-emerald-400 text-center font-medium bg-emerald-400/10 border border-emerald-400/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
          Conta criada com sucesso! Faça login para começar.
        </div>
      )}
      <form action={formAction}>
        <div className="grid gap-5">
          <div className="grid gap-2 relative">
            <Label htmlFor="email" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
              E-mail
            </Label>
            <Input
              id="email"
              name="email"
              placeholder="atleta@exemplo.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isPending}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 h-12 px-4 rounded-lg"
            />
          </div>
          <div className="grid gap-2 relative">
            <Label htmlFor="password" className="text-xs uppercase tracking-widest text-muted-foreground ml-1">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              placeholder="••••••••"
              type="password"
              autoComplete="current-password"
              disabled={isPending}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-primary focus-visible:border-primary transition-all duration-300 h-12 px-4 rounded-lg"
            />
          </div>

          {state?.error && (
            <div className="space-y-3 animate-in slide-in-from-top-2">
              <div className="text-sm text-destructive text-center font-medium bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                {state.error}
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    const emailInput = document.getElementById("email") as HTMLInputElement
                    if (emailInput.value) {
                      const formData = new FormData()
                      formData.append("email", emailInput.value)
                      import("@/app/forgot-password/actions").then(m => {
                        m.requestPasswordResetAction(formData).then(res => {
                          alert(res.success || res.error)
                        })
                      })
                    } else {
                      alert("Por favor, preencha seu e-mail para solicitar o reset de senha.")
                    }
                  }}
                  className="text-xs text-primary hover:underline font-medium uppercase tracking-wider"
                >
                  Esqueceu a senha? Resetar agora
                </button>
              </div>
            </div>
          )}

          <Button 
            disabled={isPending} 
            type="submit" 
            className="w-full h-12 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wide uppercase shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300 rounded-lg"
          >
            {isPending ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              "Entrar"
            )}
          </Button>
        </div>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-widest">
          <span className="bg-[#0f0f0f] px-3 text-muted-foreground">
            Ou acesse com
          </span>
        </div>
      </div>
      
      <form action={loginWithGoogleAction}>
        <Button 
          variant="outline" 
          type="submit" 
          className="w-full h-12 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white text-white font-medium transition-all duration-300 rounded-lg" 
          disabled={isPending}
        >
          <svg role="img" viewBox="0 0 24 24" className="mr-3 h-5 w-5 fill-current">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          Google
        </Button>
      </form>
    </div>
  )
}
