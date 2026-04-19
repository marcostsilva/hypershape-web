import { LoginForm } from "@/components/auth/login-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Login | HyperShape",
  description: "Acesse sua conta no HyperShape.",
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background">
      {/* 
        Aesthetic Anchor: Luxury Athletic / Cyber-Industrial
        Huge brutalist background text, noise texture, and severe dark gradients 
      */}
      
      {/* Base Grid & Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      {/* Massive Background Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
        <h1 className="font-heading font-black text-[20vw] leading-none text-white whitespace-nowrap text-center flex flex-col">
          <span>HYPER</span>
          <span className="text-primary">SHAPE</span>
        </h1>
      </div>

      {/* Subtle Noise Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Glassmorphism Form Container */}
      <div className="relative z-10 w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl shadow-2xl ring-1 ring-primary/20 p-8 sm:p-10 relative">
          
          {/* Subtle neon glow inside the card */}
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-primary/10 blur-[100px] pointer-events-none rounded-full" />
          
          <div className="relative z-20 flex flex-col items-center space-y-6">
            
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center w-full">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 border border-primary/30 mb-2">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-3xl font-heading font-bold tracking-tight text-white">
                Acesse sua conta
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Desbloqueie seu potencial
              </p>
            </div>
            
            {/* Auth Form Component */}
            <div className="w-full">
              <LoginForm />
            </div>
            
            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground/60 max-w-[250px]">
              Ao continuar, você concorda com nossos{" "}
              <a href="/terms" className="underline underline-offset-4 hover:text-primary transition-colors">
                Termos
              </a>{" "}
              e{" "}
              <a href="/privacy" className="underline underline-offset-4 hover:text-primary transition-colors">
                Privacidade
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
