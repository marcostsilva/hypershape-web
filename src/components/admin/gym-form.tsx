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

const gymFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  slug: z.string().min(3, "Slug deve ter pelo menos 3 caracteres").toLowerCase(),
  cnpj: z.string().min(14, "CNPJ inválido").optional().or(z.literal("")),
  corporateName: z.string().optional().or(z.literal("")),
  tradeName: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  ownerEmail: z.string().email("E-mail inválido").optional().or(z.literal("")),
  plan: z.enum(["FREE", "BASIC", "PRO", "ENTERPRISE"]),
  studentLimit: z.coerce.number().int().min(1),
})

type GymFormValues = z.infer<typeof gymFormSchema>

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
      address: initialData.address || "",
      ownerEmail: initialData.ownerEmail || "",
    } : {
      name: "",
      slug: "",
      cnpj: "",
      corporateName: "",
      tradeName: "",
      address: "",
      ownerEmail: "",
      plan: "BASIC",
      studentLimit: 50,
    },
  })

  async function onSubmit(data: GymFormValues) {
    setLoading(true)
    const res = initialData 
      ? await updateGymAction(initialData.id, data)
      : await createGymAction(data)

    if (res.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success(initialData ? "Academia atualizada!" : "Academia criada!")
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()}
            className="text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">
            {initialData ? "Editar Academia" : "Nova Academia"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Dados Principais */}
          <div className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Dados de Identificação
            </h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Fantasia</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Gold Gym Central" {...field} className="bg-black/50" />
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
                  <FormLabel>Slug da URL</FormLabel>
                  <FormControl>
                    <Input placeholder="ex: gold-gym" {...field} className="bg-black/50" />
                  </FormControl>
                  <FormDescription>Usado em hypershape.com/slug</FormDescription>
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
                    <Input placeholder="Ex: Academia Fitness LTDA" {...field} className="bg-black/50" />
                  </FormControl>
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
                    <Input placeholder="00.000.000/0000-00" {...field} className="bg-black/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Dados de Contato e Plano */}
          <div className="space-y-6 bg-zinc-900/30 p-6 rounded-2xl border border-white/5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Layers className="w-4 h-4" /> Plano e Estrutura
            </h3>

            <FormField
              control={form.control}
              name="plan"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Plano</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-black/50">
                        <SelectValue placeholder="Selecione um plano" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="FREE">Gratuito (Teste)</SelectItem>
                      <SelectItem value="BASIC">Básico (Até 50 alunos)</SelectItem>
                      <SelectItem value="PRO">Profissional (Ilimitado)</SelectItem>
                      <SelectItem value="ENTERPRISE">Enterprise (Custom)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="studentLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" /> Limite de Alunos
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} className="bg-black/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <User className="w-4 h-4" /> E-mail do Responsável
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="email@do-dono.com" {...field} className="bg-black/50" />
                  </FormControl>
                  <FormDescription>Este usuário será o administrador da academia</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> Endereço
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Rua, Número, Cidade - UF" {...field} className="bg-black/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-black font-black px-10 py-6 rounded-2xl text-lg shadow-lg shadow-primary/20"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            {initialData ? "Salvar Alterações" : "Cadastrar Academia"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
