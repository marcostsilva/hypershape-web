import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function GymLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ gymSlug: string }>
}) {
  const { gymSlug } = await params

  // Não aplicar white-label na rota especial "me"
  if (gymSlug === "me") {
    return <>{children}</>
  }

  const gym = await prisma.organization.findUnique({
    where: { slug: gymSlug },
    select: {
      primaryColor: true,
      secondaryColor: true,
      logoUrl: true,
    }
  })

  if (!gym) {
    notFound()
  }

  // Se não houver cores customizadas, usa o padrão
  if (!gym.primaryColor && !gym.secondaryColor) {
    return <>{children}</>
  }

  // Injeção de variáveis CSS dinâmicas baseadas nas cores da academia
  // Usamos o formato oklch que o Tailwind v4 espera, ou convertemos se necessário.
  // Para simplificar agora, vamos assumir que as cores no DB são HEX ou cores válidas em CSS.
  // O Tailwind v4 permite usar HEX direto em variáveis CSS.
  
  const primary = gym.primaryColor || "oklch(0.75 0.18 55)"
  const secondary = gym.secondaryColor || "oklch(0.2 0 0)"

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root, .dark {
          --primary: ${primary} !important;
          --ring: ${primary} !important;
          --accent-foreground: ${primary} !important;
          --secondary: ${secondary} !important;
          --sidebar-primary: ${primary} !important;
        }
        
        /* Ajustes de Opacidade para Acentos */
        :root, .dark {
          --accent: ${primary}26 !important; /* 15% opacity if HEX */
        }
      `}} />
      {children}
    </>
  )
}
