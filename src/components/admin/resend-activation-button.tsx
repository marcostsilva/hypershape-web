"use client"

import { useState } from "react"
import { Mail, Check, Loader2 } from "lucide-react"
import { resendActivationAction } from "@/app/[gymSlug]/admin/students/[studentId]/actions"
import { toast } from "sonner"

interface ResendActivationButtonProps {
  studentId: string
  gymSlug: string
  hasPassword?: boolean
}

export function ResendActivationButton({ studentId, gymSlug, hasPassword }: ResendActivationButtonProps) {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleResend = async () => {
    setLoading(true)
    try {
      const result = await resendActivationAction(studentId, gymSlug)
      if (result.success) {
        setSent(true)
        toast.success(result.success)
        setTimeout(() => setSent(false), 3000)
      } else {
        toast.error(result.error || "Erro ao reenviar e-mail.")
      }
    } catch (error) {
      toast.error("Ocorreu um erro inesperado.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleResend}
      disabled={loading}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
        sent 
          ? "bg-emerald-500/10 border-emerald-500 text-emerald-500" 
          : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
      }`}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : sent ? (
        <Check className="w-3.5 h-3.5" />
      ) : (
        <Mail className="w-3.5 h-3.5" />
      )}
      {hasPassword ? "Reenviar link de reset" : "Reenviar e-mail de ativação"}
    </button>
  )
}
