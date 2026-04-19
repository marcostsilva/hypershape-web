import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function GymAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Verificar se o usuário tem permissão para esta academia
  if ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "COACH") {
    redirect(`/${gymSlug}/dashboard`)
  }

  return (
    <div className="flex bg-black min-h-screen">
      <AdminSidebar role="GYM_ADMIN" gymSlug={gymSlug} />
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
