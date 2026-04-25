"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function BackButton({ className, children, ...props }: BackButtonProps) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={cn(
        "p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white",
        className
      )}
      aria-label="Voltar"
      {...props}
    >
      {children || <ArrowLeft className="h-5 w-5" />}
    </button>
  )
}
