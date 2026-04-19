import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    redirect("/")
  }

  return (
    <div className="flex bg-black min-h-screen">
      <AdminSidebar role="SUPER_ADMIN" />
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
