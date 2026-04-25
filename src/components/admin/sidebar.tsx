"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  BarChart3, 
  Settings, 
  HelpCircle, 
  LogOut,
  Dumbbell,
  CreditCard,
  FileText,
  UserCog,
  ChevronLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "next-auth/react"

import Image from "next/image"

interface SidebarItem {
  title: string
  href: string
  icon: any
}

interface AdminSidebarProps {
  role: "SUPER_ADMIN" | "GYM_ADMIN"
  gymSlug?: string
  gymLogo?: string | null
  gymName?: string | null
}

export function AdminSidebar({ role, gymSlug, gymLogo, gymName }: AdminSidebarProps) {
  const pathname = usePathname()

  const superAdminItems: SidebarItem[] = [
    { title: "Cockpit Global", href: "/admin", icon: LayoutDashboard },
    { title: "Academias", href: "/admin/gyms", icon: Building2 },
    { title: "Usuários", href: "/admin/users", icon: UserCog },
    { title: "Estatísticas", href: "/admin/stats", icon: BarChart3 },
    { title: "Relatórios", href: "/admin/reports", icon: FileText },
    { title: "Configurações", href: "/admin/settings", icon: Settings },
  ]

  const gymAdminItems: SidebarItem[] = [
    { title: "Dashboard Unidade", href: `/${gymSlug}/admin`, icon: LayoutDashboard },
    { title: "Gestão de Alunos", href: `/${gymSlug}/admin/students`, icon: Users },
    { title: "Treinos & Planilhas", href: `/${gymSlug}/admin/workouts`, icon: Dumbbell },
    { title: "Financeiro", href: `/${gymSlug}/admin/finance`, icon: CreditCard },
    { title: "Dados da Unidade", href: `/${gymSlug}/admin/details`, icon: Building2 },
    { title: "Relatórios", href: `/${gymSlug}/admin/reports`, icon: FileText },
    { title: "Suporte", href: `/${gymSlug}/admin/support`, icon: HelpCircle },
  ]

  const items = role === "SUPER_ADMIN" ? superAdminItems : gymAdminItems

  return (
    <div className="w-64 bg-zinc-950 border-r border-white/5 h-screen sticky top-0 flex flex-col p-4">
      {/* Brand */}
      <div className="flex items-center gap-3 px-2 mb-10">
        {gymLogo ? (
          <Image 
            src={gymLogo} 
            alt={gymName || "Academia"} 
            width={32} 
            height={32} 
            className="w-8 h-8 object-contain" 
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-black">
            {gymName ? gymName.charAt(0).toUpperCase() : "H"}
          </div>
        )}
        <span className="font-black text-xl tracking-tighter text-white truncate">
          {gymName ? gymName.toUpperCase() : (
            <>
              HYPER<span className="text-primary">SHAPE</span>
            </>
          )}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-black font-bold shadow-lg shadow-primary/20" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-black" : "group-hover:scale-110 transition-transform")} />
              <span className="text-sm">{item.title}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5 space-y-2">
        <Link 
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white transition-all text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" />
          Voltar ao App
        </Link>
        <button 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500/50 hover:text-red-500 hover:bg-red-500/5 transition-all text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair do ERP</span>
        </button>
      </div>
    </div>
  )
}
