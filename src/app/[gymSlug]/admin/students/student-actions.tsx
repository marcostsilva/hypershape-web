"use client"

import { MoreVertical, Ban, UserCog, ShieldAlert, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface StudentActionsProps {
  studentId: string
  studentName: string
}

export function StudentActions({ studentId, studentName }: StudentActionsProps) {
  const handleAction = (action: string) => {
    alert(`${action} para o aluno ${studentName}`)
    // Aqui implementaremos as Server Actions reais futuramente
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-zinc-500 hover:text-white">
            <span className="sr-only">Abrir menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-zinc-900 border-white/10 text-zinc-400">
          <DropdownMenuLabel className="text-white">Ações</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleAction("Editar")} className="hover:bg-white/5 cursor-pointer">
            <UserCog className="mr-2 h-4 w-4" />
            Editar Perfil
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Gerir Acesso")} className="hover:bg-white/5 cursor-pointer">
            <ShieldAlert className="mr-2 h-4 w-4" />
            Gerir Acesso
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/5" />
          <DropdownMenuItem onClick={() => handleAction("Bloquear")} className="text-amber-500 hover:bg-amber-500/10 cursor-pointer">
            <Ban className="mr-2 h-4 w-4" />
            Bloquear Aluno
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleAction("Remover")} className="text-red-500 hover:bg-red-500/10 cursor-pointer">
            <Trash2 className="mr-2 h-4 w-4" />
            Remover da Academia
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
