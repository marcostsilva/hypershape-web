import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { GymForm } from "@/components/admin/gym-form"

export default async function NewGymPage() {
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).gymId) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <GymForm />
      </div>
    </div>
  )
}
