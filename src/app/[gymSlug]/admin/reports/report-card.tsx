"use client"

import { useState } from "react"
import { Download, Loader2 } from "lucide-react"
import { generateReportAction } from "./actions"
import { toast } from "sonner"

interface ReportCardProps {
  title: string
  description: string
  icon: any
  gymSlug: string
}

export function ReportCard({ title, description, icon: Icon, gymSlug }: ReportCardProps) {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const result = await generateReportAction(title, gymSlug)
      toast.success(result.summary)
    } catch (error) {
      toast.error("Erro ao gerar relatório")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 hover:border-primary/50 transition-all group flex items-start gap-6">
      <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform flex-shrink-0">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-zinc-500 text-sm mb-6 leading-relaxed">{description}</p>
        <button 
          onClick={handleGenerate}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-black uppercase text-primary hover:underline disabled:opacity-50"
        >
          {loading ? (
            <>Processando... <Loader2 className="w-3 h-3 animate-spin" /></>
          ) : (
            <>Gerar Relatório <Download className="w-3 h-3" /></>
          )}
        </button>
      </div>
    </div>
  )
}
