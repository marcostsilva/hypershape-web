"use client"

import { updateGymBrandingAction } from "./actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"

interface BrandingFormProps {
  gymId: string
  gymSlug: string
  initialPrimary: string | null
  initialSecondary: string | null
  initialLogo: string | null
}

export function BrandingForm({ 
  gymId, 
  gymSlug, 
  initialPrimary, 
  initialSecondary, 
  initialLogo 
}: BrandingFormProps) {
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsPending(true)
    try {
      const result = await updateGymBrandingAction(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Branding atualizado com sucesso!")
      }
    } catch (error) {
      toast.error("Erro ao atualizar branding.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form action={handleSubmit} className="md:col-span-2 bg-zinc-950 border border-primary/20 rounded-3xl p-8 space-y-6">
      <input type="hidden" name="gymId" value={gymId} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Globe className="w-6 h-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold">Identidade Visual (White-label)</h2>
            <p className="text-zinc-500 text-sm">Personalize a aparência do dashboard para seus alunos.</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-primary text-black text-[10px] font-black uppercase rounded">
          Beta
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
        <div className="space-y-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cor Primária</p>
          <div className="flex items-center gap-3">
            <Input 
              type="color" 
              name="primaryColor" 
              defaultValue={initialPrimary || '#EAB308'} 
              className="w-12 h-10 p-1 bg-white/5 border-white/10 cursor-pointer"
            />
            <Input 
              type="text" 
              name="primaryColorText"
              defaultValue={initialPrimary || '#EAB308'}
              className="bg-white/5 border-white/10 text-white font-mono text-sm h-10"
              placeholder="#HEX"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Cor Secundária</p>
          <div className="flex items-center gap-3">
            <Input 
              type="color" 
              name="secondaryColor" 
              defaultValue={initialSecondary || '#000000'} 
              className="w-12 h-10 p-1 bg-white/5 border-white/10 cursor-pointer"
            />
            <Input 
              type="text" 
              name="secondaryColorText"
              defaultValue={initialSecondary || '#000000'}
              className="bg-white/5 border-white/10 text-white font-mono text-sm h-10"
              placeholder="#HEX"
            />
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Logo da Unidade</p>
          <Input 
            type="text" 
            name="logoUrl"
            defaultValue={initialLogo || ''}
            className="bg-white/5 border-white/10 text-white text-sm h-10"
            placeholder="https://sua-logo.png"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-white/5">
        <Button 
          type="submit" 
          disabled={isPending}
          className="px-8 py-3 bg-primary text-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-primary/20"
        >
          {isPending ? "Salvando..." : "Salvar Alterações de Marca"}
        </Button>
      </div>
    </form>
  )
}
