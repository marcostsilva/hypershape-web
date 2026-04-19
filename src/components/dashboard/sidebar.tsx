"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Flame, LayoutDashboard, Dumbbell, Ruler, LogOut } from "lucide-react"
import { signOut } from "next-auth/react"

const navItems = [
  { name: "Visão Geral", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meus Treinos", href: "/dashboard/workouts", icon: Dumbbell },
  { name: "Medidas Corporais", href: "/dashboard/measurements", icon: Ruler },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()

  const userName = session?.user?.name || "Atleta"
  const userEmail = session?.user?.email || ""
  const userImage = session?.user?.image

  return (
    <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl hidden md:flex flex-col h-full absolute inset-y-0 left-0 z-20">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <Flame className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
          <span className="font-heading font-bold text-xl tracking-tight text-white">
            Hyper<span className="text-primary">Shape</span>
          </span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-300"
                }`}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User profile + Logout */}
      <div className="border-t border-white/5">
        {/* Profile row */}
        <div className="px-4 py-3 flex items-center gap-3">
          {userImage ? (
            <Image
              src={userImage}
              alt={userName}
              width={36}
              height={36}
              className="rounded-full border border-white/10"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-zinc-400">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 pb-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="group flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-md text-zinc-400 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="mr-3 h-4 w-4 flex-shrink-0 text-zinc-500 group-hover:text-destructive" />
            Sair da conta
          </button>
        </div>
      </div>
    </aside>
  )
}
