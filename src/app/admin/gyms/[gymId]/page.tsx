import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { GymForm } from "@/components/admin/gym-form"

export default async function EditGymPage({
  params,
}: {
  params: Promise<{ gymId: string }>
}) {
  const { gymId } = await params
  const session = await auth()
  
  if (!session?.user || (session.user as any).role !== "ADMIN" || (session.user as any).organizationId) {
    redirect("/")
  }

  const gym = await prisma.organization.findUnique({
    where: { id: gymId }
  })

  if (!gym) notFound()

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <GymForm initialData={JSON.parse(JSON.stringify(gym))} />
      </div>
    </div>
  )
}
