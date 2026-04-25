import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin/sidebar"
import prisma from "@/lib/prisma"
import { BrandingProvider } from "@/components/dashboard/branding-provider"
import { requireTermsAccepted } from "@/lib/require-terms"

export default async function GymAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ gymSlug: string }>
}) {
  await requireTermsAccepted()
  const { gymSlug } = await params
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  // Buscar a organização e o membership do usuário
  const organization = await prisma.organization.findUnique({
    where: { slug: gymSlug },
    include: {
      memberships: {
        where: { userId: session.user.id },
        select: { role: true, status: true }
      }
    }
  })

  if (!organization) {
    redirect("/")
  }

  const userMembership = organization.memberships[0]
  const isSuperAdmin = (session.user as any).role === "ADMIN" && !(session.user as any).organizationId

  // Verificar se o usuário tem permissão (é membro da academia com role correto ou é super admin)
  if (!isSuperAdmin) {
    if (!userMembership || (userMembership.role !== "ADMIN" && userMembership.role !== "COACH") || userMembership.status !== "ACTIVE") {
      redirect(`/${gymSlug}/dashboard`)
    }
  }

  return (
    <BrandingProvider 
      primaryColor={organization.primaryColor} 
      secondaryColor={organization.secondaryColor}
    >
      <div className="flex bg-black min-h-screen">
        <AdminSidebar 
          role={(userMembership?.role === "ADMIN" || isSuperAdmin) ? "GYM_ADMIN" : "GYM_ADMIN" as any} 
          gymSlug={gymSlug} 
          gymLogo={organization.logoUrl} 
          gymName={organization.name} 
        />
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black">
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </BrandingProvider>
  )
}
