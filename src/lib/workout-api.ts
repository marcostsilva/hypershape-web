import { ExerciseCategory, Exercise } from "./exercise-data"

export interface WorkoutApiExercise {
  id: string
  code: string
  name: string
  description?: string
  primaryMuscles?: Array<{ name: string }>
  categories?: Array<{ name: string }>
}

/**
 * Busca exercícios na WorkoutAPI e mapeia para o formato do app.
 */
export async function fetchWorkoutApiExercises(): Promise<ExerciseCategory[]> {
  const apiKey = process.env.WORKOUT_API_KEY

  // Se não tiver chave, retorna vazio ou pode lançar erro
  if (!apiKey) {
    console.warn("WORKOUT_API_KEY não configurada no .env")
    return []
  }

  try {
    const res = await fetch("https://api.workoutapi.com/exercises", {
      headers: {
        "x-api-key": apiKey,
        "Accept-Language": "pt-BR", // Tenta buscar em português
      },
      next: { revalidate: 86400 }, // Cache de 1 dia
    })

    if (!res.ok) {
      throw new Error(`Erro na WorkoutAPI: ${res.statusText}`)
    }

    const data: WorkoutApiExercise[] = await res.json()

    // Mapeamento: agrupando por categoria
    // Nota: Como o JSON base não inclui imagem, deixamos a URL preparada.
    // Você pode precisar ajustar a montagem da URL da imagem conforme a documentação oficial.
    const categoriesMap = new Map<string, ExerciseCategory>()

    data.forEach((ex) => {
      // Pega a primeira categoria, ou usa "Outros"
      const categoryName = ex.categories?.[0]?.name || "Outros"
      
      if (!categoriesMap.has(categoryName)) {
        categoriesMap.set(categoryName, {
          name: categoryName,
          exercises: []
        })
      }

      // A imagem é servida pela nossa rota local que injeta a chave da API de forma segura
      const imageUrl = `/api/exercises/${ex.id}/image`

      categoriesMap.get(categoryName)!.exercises.push({
        id: ex.id,
        name: ex.name,
        category: categoryName,
        imageUrl: imageUrl, // Nova propriedade
      })
    })

    // Retorna como array, ordenado por nome da categoria
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name))

  } catch (error) {
    console.error("Erro ao buscar exercícios da WorkoutAPI:", error)
    return []
  }
}
