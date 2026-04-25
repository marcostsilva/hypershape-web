"use client"

interface BrandingProviderProps {
  primaryColor?: string | null
  secondaryColor?: string | null
  children: React.ReactNode
}

export function BrandingProvider({ primaryColor, secondaryColor, children }: BrandingProviderProps) {
  const styles = `
    :root {
      ${primaryColor ? `--primary: ${primaryColor} !important; --sidebar-primary: ${primaryColor} !important; --sidebar-ring: ${primaryColor} !important; --ring: ${primaryColor} !important; --chart-1: ${primaryColor} !important;` : ""}
      ${secondaryColor ? `--secondary: ${secondaryColor} !important;` : ""}
    }
  `

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      {children}
    </>
  )
}
