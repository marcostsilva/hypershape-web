import { Sidebar } from "@/components/dashboard/sidebar"
import { Providers } from "@/components/providers"
import { Flame, Menu } from "lucide-react"
import prisma from "@/lib/prisma"
import { BrandingProvider } from "@/components/dashboard/branding-provider"
import Image from "next/image"
import { requireTermsAccepted } from "@/lib/require-terms"

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ gymSlug: string }>
}) {
  await requireTermsAccepted()
  const { gymSlug } = await params
  
  // Para usuários independentes (B2C), não buscar organização
  let gym: { primaryColor: string | null; secondaryColor: string | null; logoUrl: string | null; name: string } | null = null
  
  if (gymSlug !== "me") {
    gym = await prisma.organization.findUnique({
      where: { slug: gymSlug },
      select: {
        primaryColor: true,
        secondaryColor: true,
        logoUrl: true,
        name: true
      }
    })
  }

  return (
    <Providers>
      <BrandingProvider 
        primaryColor={gym?.primaryColor} 
        secondaryColor={gym?.secondaryColor}
      >
        <div className="relative min-h-screen bg-background overflow-hidden">
        {/* Background Texture (Luxury Athletic) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-96 bg-primary/5 blur-[120px] pointer-events-none" />

        {/* Mobile Topbar */}
        <div className="md:hidden flex h-16 items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-xl relative z-20">
          <div className="flex items-center gap-2">
            {gym?.logoUrl ? (
              <Image 
                src={gym.logoUrl} 
                alt={gym.name} 
                width={24} 
                height={24} 
                className="h-6 w-6 object-contain" 
              />
            ) : (
              <Flame className="h-6 w-6 text-primary" />
            )}
            <span className="font-heading font-bold text-xl tracking-tight text-white truncate max-w-[180px]">
              {gym?.name || (
                <>
                  Hyper<span className="text-primary">Shape</span>
                </>
              )}
            </span>
          </div>
          <button className="text-zinc-400 hover:text-white">
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex h-screen md:h-auto md:min-h-screen relative z-10">
          <Sidebar 
            gymSlug={gymSlug} 
            gymLogo={gym?.logoUrl} 
            gymName={gym?.name} 
          />
          
          {/* Main Content Area */}
          <main className="flex-1 md:pl-64 flex flex-col h-full overflow-y-auto">
            <div className="flex-1 p-4 sm:p-8 max-w-6xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
      </BrandingProvider>
    </Providers>
  )
}
