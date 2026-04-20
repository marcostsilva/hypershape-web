"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { 
  Building2, 
  MapPin, 
  User, 
  FileText, 
  Layers, 
  Users as UsersIcon,
  ChevronLeft,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createGymAction, updateGymAction } from "@/app/admin/gyms/actions"

import { maskCNPJ, maskCEP } from "@/lib/utils/masks"

const gymFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").toLowerCase(),
  cnpj: z.string().optional().or(z.literal("")),
  corporateName: z.string().optional().or(z.literal("")),
  tradeName: z.string().optional().or(z.literal("")),
  
  // Endereço Estruturado
  street: z.string().optional().or(z.literal("")),
  number: z.string().optional().or(z.literal("")),
  complement: z.string().optional().or(z.literal("")),
  neighborhood: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  state: z.string().optional().or(z.literal("")),
  zipCode: z.string().optional().or(z.literal("")),
  
  ownerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  plan: z.enum(["STARTER", "PRO", "ELITE", "ENTERPRISE"]),
  maxStudents: z.number().int().min(1),
})

interface GymFormValues {
  name: string
  slug: string
  cnpj?: string
  corporateName?: string
  tradeName?: string
  street?: string
  number?: string
  complement?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  ownerEmail?: string
  plan: "STARTER" | "PRO" | "ELITE" | "ENTERPRISE"
  maxStudents: number
}

interface GymFormProps {
  initialData?: any
}

export function GymForm({ initialData }: GymFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<GymFormValues>({
    resolver: zodResolver(gymFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      cnpj: initialData.cnpj || "",
      corporateName: initialData.corporateName || "",
      tradeName: initialData.tradeName || "",
      street: initialData.street || "",
      number: initialData.number || "",
      complement: initialData.complement || "",
      neighborhood: initialData.neighborhood || "",
      city: initialData.city || "",
      state: initialData.state || "",
      zipCode: initialData.zipCode || "",
      ownerEmail: initialData.ownerEmail || "",
      maxStudents: initialData.maxStudents || initialData.studentLimit || 50,
    } : {
      name: "",
      slug: "",
      cnpj: "",
      corporateName: "",
      tradeName: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      zipCode: "",
      ownerEmail: "",
      plan: "STARTER",
      maxStudents: 50,
    },
  })

  async function handleCEPBlur(cep: string) {
    const cleanCEP = cep.replace(/\D/g, "")
    if (cleanCEP.length !== 8) return

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`)
      const data = await response.json()

      if (!data.erro) {
        form.setValue("street", data.logradouro)
        form.setValue("neighborhood", data.bairro)
        form.setValue("city", data.localidade)
        form.setValue("state", data.uf)
        toast.success("Endereço preenchido automaticamente!")
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error)
    }
  }

  async function onSubmit(data: GymFormValues) {
    setLoading(true)
    try {
      const res = initialData 
        ? await updateGymAction(initialData.id, data)
        : await createGymAction(data)

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success(initialData ? "Academia atualizada com sucesso!" : "Academia cadastrada com sucesso!")
        router.push("/admin/gyms")
        router.refresh()
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao processar sua solicitação.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12 max-w-5xl pb-20">
        <div className="flex items-center gap-4 mb-10">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Voltar
          </Button>
          <div>
            <h2 className="text-3xl font-black tracking-tighter text-white">
              {initialData ? "EDITAR" : "NOVA"} <span className="text-primary underline decoration-primary/30 underline-offset-8">UNIDADE</span>
            </h2>
            <p className="text-zinc-500 text-sm mt-1">Gerencie as configurações e limites desta academia.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sessão 1: Identificação Corporativa */}
          <div className="space-y-6 bg-zinc-900/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Identificação</h3>
            </div>
            
            <div className="grid grid-cols-1 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Fantasia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Gold Gym Central" {...field} className="bg-black/40 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug da URL (Único)</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: gold-gym" {...field} className="bg-black/40 border-white/10" />
                    </FormControl>
                    <FormDescription className="text-[10px]">hypershape.com/{field.value || 'slug'}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="00.000.000/0000-00" 
                        {...field} 
                        onChange={(e) => field.onChange(maskCNPJ(e.target.value))}
                        className="bg-black/40 border-white/10 font-mono" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="corporateName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razão Social</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Academia Fitness LTDA" {...field} className="bg-black/40 border-white/10" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Sessão 2: Plano e Admin */}
          <div className="space-y-6 bg-zinc-900/20 p-8 rounded-3xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Layers className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Contrato & Admin</h3>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plano de Assinatura</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-black/40 border-white/10 h-11">
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-zinc-950 border-white/10 text-white">
                          <SelectItem value="STARTER">Starter (Até 50 alunos)</SelectItem>
                          <SelectItem value="PRO">Profissional (Tiered)</SelectItem>
                          <SelectItem value="ELITE">Elite</SelectItem>
                          <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-1">
                <FormField
                  control={form.control}
                  name="maxStudents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UsersIcon className="w-3.5 h-3.5 text-zinc-500" /> Limite Alunos
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                          className="bg-black/40 border-white/10" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-2 mt-4">
                <FormField
                  control={form.control}
                  name="ownerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2 text-primary">
                        <User className="w-4 h-4" /> E-mail do Administrador Responsável
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="email@do-dono.com" {...field} className="bg-primary/5 border-primary/20 focus:border-primary" />
                      </FormControl>
                      <FormDescription className="text-[10px]">Este usuário deve estar pré-cadastrado para assumir a gestão desta unidade.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Sessão 3: Endereço Detalhado (Full Width) */}
          <div className="lg:col-span-2 space-y-6 bg-zinc-950/40 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <MapPin className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Localização da Unidade</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-5">
              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="00000-000" 
                          {...field} 
                          onChange={(e) => field.onChange(maskCEP(e.target.value))}
                          onBlur={(e) => handleCEPBlur(e.target.value)}
                          className="bg-black/40 border-white/10 font-mono" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logradouro / Rua</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Av. Paulista" {...field} className="bg-black/40 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input placeholder="123" {...field} className="bg-black/40 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="complement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comp.</FormLabel>
                      <FormControl>
                        <Input placeholder="Sala 2" {...field} className="bg-black/40 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="neighborhood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bairro</FormLabel>
                      <FormControl>
                        <Input placeholder="Centro" {...field} className="bg-black/40 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input placeholder="São Paulo" {...field} className="bg-black/40 border-white/10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="md:col-span-1">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UF</FormLabel>
                      <FormControl>
                        <Input placeholder="SP" maxLength={2} {...field} className="bg-black/40 border-white/10 uppercase" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-10 border-t border-white/5">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            disabled={loading}
            className="px-10 py-6 rounded-2xl border-white/10 text-zinc-400 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-black font-black px-12 py-6 rounded-2xl text-lg shadow-2xl shadow-primary/30 transition-all hover:scale-105"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {initialData ? "SALVAR ALTERAÇÕES" : "FINALIZAR CADASTRO"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
