import { auth } from "@/auth"
import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"

/**
 * GET /api/v1/sync/routines
 * Busca treinos prescritos (templates) para sincronização com o mobile.
 */
export async function GET(req: Request) {
  const session = await auth()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const userId = session.user.id!
  const { searchParams } = new URL(req.url)
  const since = searchParams.get("since")

  try {
    const routines = await prisma.workout.findMany({
      where: {
        userId,
        isTemplate: true,
        ...(since ? { 
          updatedAt: { 
            gt: new Date(since) 
          } 
        } : {})
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ 
      success: true,
      routines,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Fetch routines error:", error)
    return NextResponse.json({ error: "Erro ao buscar rotinas" }, { status: 500 })
  }
}
