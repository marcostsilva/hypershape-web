"use client"

import { useActionState } from "react"
import { createMeasurementAction } from "@/app/[gymSlug]/dashboard/measurements/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useEffect } from "react"

interface MeasurementFormProps {
  gymSlug: string
  isManaged: boolean
}

export function MeasurementForm({ gymSlug, isManaged }: MeasurementFormProps) {
  const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
    return await createMeasurementAction(formData)
  }, null)

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error)
    } else if (state?.data) {
      toast.success(state.data)
      // Reset form if success? Actually Next does it for us or we can use ref
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-5 relative z-10">
      <fieldset disabled={isManaged || isPending} className="space-y-5">
        <input type="hidden" name="gymSlug" value={gymSlug} />
        
        {/* Peso + Altura + BF */}
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="weight" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Peso (kg)</Label>
            <Input id="weight" name="weight" type="number" step="0.1" required placeholder="80.5" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="height" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Altura (m)</Label>
            <Input id="height" name="height" type="number" step="0.01" placeholder="1.75" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bodyFat" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">BF (%)</Label>
            <Input id="bodyFat" name="bodyFat" type="number" step="0.1" placeholder="15" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
          </div>
        </div>

        {/* Braços */}
        <div className="space-y-2 pt-3 border-t border-white/5">
          <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold ml-1">Braços (cm)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="armRight" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Braço Dir</Label>
              <Input id="armRight" name="armRight" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="armLeft" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Braço Esq</Label>
              <Input id="armLeft" name="armLeft" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Pernas */}
        <div className="space-y-2 pt-3 border-t border-white/5">
          <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold ml-1">Pernas (cm)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="thighRight" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Coxa Dir</Label>
              <Input id="thighRight" name="thighRight" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="thighLeft" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Coxa Esq</Label>
              <Input id="thighLeft" name="thighLeft" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calfRight" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Panturrilha Dir</Label>
              <Input id="calfRight" name="calfRight" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="calfLeft" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Panturrilha Esq</Label>
              <Input id="calfLeft" name="calfLeft" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Tronco */}
        <div className="space-y-2 pt-3 border-t border-white/5">
          <h3 className="text-[10px] uppercase tracking-widest text-primary font-bold ml-1">Tronco (cm)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="chest" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Peitoral</Label>
              <Input id="chest" name="chest" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="neck" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Pescoço</Label>
              <Input id="neck" name="neck" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="waist" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Cintura</Label>
              <Input id="waist" name="waist" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hips" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Quadril</Label>
              <Input id="hips" name="hips" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="glutes" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Glúteos</Label>
              <Input id="glutes" name="glutes" type="number" step="0.1" className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-9 text-sm" />
            </div>
          </div>
        </div>

        {/* Data */}
        <div className="space-y-1.5 pt-3 border-t border-white/5">
          <Label htmlFor="measuredAt" className="text-[10px] uppercase tracking-widest text-muted-foreground ml-1">Data da Avaliação</Label>
          <Input id="measuredAt" name="measuredAt" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} className="bg-white/5 border-white/10 text-white focus-visible:ring-primary h-10 text-sm" style={{ colorScheme: "dark" }} />
        </div>

        <Button type="submit" disabled={isPending} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all mt-4">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Medidas"}
        </Button>
      </fieldset>
    </form>
  )
}
