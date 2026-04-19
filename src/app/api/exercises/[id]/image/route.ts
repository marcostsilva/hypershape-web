import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const apiKey = process.env.WORKOUT_API_KEY

  if (!apiKey) {
    return new NextResponse("Missing WORKOUT_API_KEY", { status: 500 })
  }

  try {
    // Busca a imagem no formato PNG (conforme documentação da WorkoutAPI)
    const res = await fetch(`https://api.workoutapi.com/exercises/${id}/image?format=png`, {
      headers: {
        "x-api-key": apiKey,
      },
      // Faz o cache da imagem no servidor do Next.js
      next: { revalidate: 604800 }, // 1 semana
    })

    if (!res.ok) {
      return new NextResponse(`Error fetching image: ${res.statusText}`, { status: res.status })
    }

    const contentType = res.headers.get("content-type") || "image/png"
    const buffer = await res.arrayBuffer()

    // Retorna a imagem com cache agressivo para o navegador do usuário
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving exercise image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
