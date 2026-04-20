"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createStudentAction } from "./actions"

const studentFormSchema = z.object({
  name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido"),
  gymSlug: z.string(),
})

type StudentFormValues = z.infer<typeof studentFormSchema>

interface StudentFormProps {
  gymSlug: string
}

export function StudentForm({ gymSlug }: StudentFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      name: "",
      email: "",
      gymSlug,
    },
  })

  async function onSubmit(data: StudentFormValues) {
    setLoading(true)
    try {
      const res = await createStudentAction(data)

      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success("Aluno cadastrado com sucesso!")
        router.push(`/${gymSlug}/admin/students`)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">Nome Completo</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Ex: João da Silva" 
                  {...field} 
                  className="bg-black/50 border-white/10 h-12" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-zinc-300">E-mail</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="Ex: joao@email.com" 
                  {...field} 
                  className="bg-black/50 border-white/10 h-12" 
                />
              </FormControl>
              <p className="text-[10px] text-zinc-500 mt-2">
                O aluno usará este e-mail para fazer login no aplicativo.
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 rounded-xl transition-all hover:scale-[1.02]"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5 mr-2" />
                CADASTRAR ALUNO
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
