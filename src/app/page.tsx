import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }
  
  const user = session.user as any
  const isSuperAdmin = user.role === "ADMIN" && !user.organizationId
  
  // Roteamento inteligente baseado no perfil do usuário
  if (isSuperAdmin) {
    redirect("/admin")
  }
  
  if (user.gymSlug) {
    if (user.role === "ADMIN") {
      redirect(`/${user.gymSlug}/admin`)
    } else if (user.role === "COACH") {
      redirect(`/${user.gymSlug}/admin/students`)
    } else {
      // USER ou INDEPENDENT (MEMBER)
      redirect(`/${user.gymSlug}/dashboard`)
    }
  }

  // Usuário independente (B2C) — sem academia vinculada
  redirect("/me/dashboard")
}

