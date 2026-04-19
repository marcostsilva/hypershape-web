import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { createMeasurementAction, deleteMeasurementAction } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Ruler, Plus, Trash2, TrendingUp } from "lucide-react"
import { ProgressCharts } from "@/components/dashboard/charts/progress-charts"

// Helper para definir os campos de circunferência do formulário
const measurementFields = [
  // Dados base
  { section: "base", fields: [
    { name: "weight", label: "Peso (kg)", required: true, step: "0.1", placeholder: "Ex: 80.5" },
    { name: "height", label: "Altura (m)", required: false, step: "0.01", placeholder: "Ex: 1.75" },
  ]},
  // Tronco
  { section: "Tronco", fields: [
    { name: "chest", label: "Peitoral (cm)" },
    { name: "neck", label: "Pescoço (cm)" },
    { name: "waist", label: "Cintura (cm)" },
    { name: "hips", label: "Quadril (cm)" },
    { name: "glutes", label: "Glúteos (cm)" },
  ]},
  // Membros superiores
  { section: "Braços", fields: [
    { name: "armRight", label: "Braço Dir (cm)" },
    { name: "armLeft", label: "Braço Esq (cm)" },
  ]},
  // Membros inferiores
  { section: "Pernas", fields: [
    { name: "thighRight", label: "Coxa Dir (cm)" },
    { name: "thighLeft", label: "Coxa Esq (cm)" },
    { name: "calfRight", label: "Panturrilha Dir (cm)" },
    { name: "calfLeft", label: "Panturrilha Esq (cm)" },
  ]},
] as const

// Labels amigáveis para exibir no histórico
const fieldLabels: Record<string, string> = {
  height: "Altura",
  chest: "Peitoral",
  neck: "Pescoço",
  waist: "Cintura",
  hips: "Quadril",
  glutes: "Glúteos",
  armRight: "Braço D",
  armLeft: "Braço E",
  thighRight: "Coxa D",
  thighLeft: "Coxa E",
  calfRight: "Pantur. D",
  calfLeft: "Pantur. E",
}

export default async function MeasurementsPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  let gymId: string | null = null
  if (gymSlug !== "me") {
    const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
    if (!gym) redirect("/me/dashboard")
    gymId = gym.id
  }

  const history = await prisma.measurement.findMany({
    where: { 
      userId: session.user.id,
      gymId: gymId
    },
    orderBy: { measuredAt: "desc" }
  })

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Medidas Corporais</h1>
          <p className="text-zinc-400 mt-1">Acompanhe sua evolução detalhada.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Formulário de Nova Medida */}
        <div className="lg:col-span-1">
          <div className="bg-black/40 border border-white/5 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Ruler className="w-24 h-24 text-primary" />
            </div>
            
            <h2 className="text-lg font-heading font-bold text-white mb-6 relative z-10 flex items-center">
              <Plus className="w-5 h-5 mr-2 text-primary" />
              Nova Avaliação
            </h2>

            <form action={createMeasurementAction} className="space-y-5 relative z-10">
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

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all mt-4">
                Salvar Medidas
              </Button>
            </form>
          </div>
        </div>

        {/* Gráficos + Histórico */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gráficos de Progresso */}
          {history.length >= 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Progresso
              </h2>
              <ProgressCharts data={JSON.parse(JSON.stringify(history))} />
            </div>
          )}

          {/* Histórico de Avaliações */}
          <div>
            <h2 className="text-lg font-heading font-bold text-white mb-4">Histórico</h2>
            
            {history.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-md">
                <Ruler className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-zinc-300 font-medium">Nenhuma avaliação registrada</h3>
                <p className="text-sm text-zinc-500 mt-1">Sua evolução corporal aparecerá aqui.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {history.map((record) => {
                  const details = record.measurements as Record<string, number> | null || {}
                  const entries = details ? Object.entries(details).filter(([, v]) => v) : []
                  const height = details?.height ?? null
                  const imc = height && height > 0 ? record.weight / (height * height) : null
                  const imcCategory = imc
                    ? imc < 18.5 ? { label: "Abaixo", color: "text-blue-400 bg-blue-400/10 border-blue-400/20" }
                    : imc < 25 ? { label: "Normal", color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20" }
                    : imc < 30 ? { label: "Sobrepeso", color: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" }
                    : { label: "Obesidade", color: "text-red-400 bg-red-400/10 border-red-400/20" }
                    : null

                  return (
                    <div key={record.id} className="bg-black/20 border border-white/5 hover:border-primary/30 transition-colors rounded-xl p-5 relative group">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-heading font-bold text-xl text-white group-hover:text-primary transition-colors">
                            {record.weight} kg
                          </h3>
                          <p className="text-xs text-zinc-500">
                            {new Date(record.measuredAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {imc && imcCategory && (
                            <div className={`px-2 py-1 rounded text-xs font-bold border ${imcCategory.color}`}>
                              IMC {imc.toFixed(1)} · {imcCategory.label}
                            </div>
                          )}
                          {record.bodyFat && (
                            <div className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/20">
                              {record.bodyFat}% BF
                            </div>
                          )}
                          
                          <form action={async () => {
                            "use server"
                            await deleteMeasurementAction(record.id, gymSlug)
                          }}>
                            <button type="submit" className="text-zinc-600 hover:text-destructive transition-colors" title="Remover Registro">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </form>
                        </div>
                      </div>

                      {height && (
                        <div className="text-[10px] uppercase text-zinc-500 mb-2">
                          Altura<br/>
                          <span className="text-zinc-300 font-bold text-xs">{height} m</span>
                        </div>
                      )}
                      
                      {entries.filter(([key]) => key !== "height").length > 0 && (
                        <div className="grid grid-cols-3 gap-x-3 gap-y-2 mt-3 pt-3 border-t border-white/5">
                          {entries.filter(([key]) => key !== "height").map(([key, value]) => (
                            <div key={key} className="text-[10px] uppercase text-zinc-500 leading-tight">
                              {fieldLabels[key] || key}<br/>
                              <span className="text-zinc-300 font-bold text-xs">
                                {value} cm
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
