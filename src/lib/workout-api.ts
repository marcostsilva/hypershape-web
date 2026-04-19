import exerciseCatalogStatic, { ExerciseCategory } from "./exercise-data"

export async function fetchWorkoutApiExercises(): Promise<ExerciseCategory[]> {
  // A pedido do usuário, voltamos os exercícios por categoria muscular em PT-BR (conforme estava antes).
  // Como a WorkoutAPI retorna nomes em inglês e categorias diferentes, 
  // usaremos nosso catálogo estático como fonte de verdade e apenas injetamos a URL da imagem.
  
  // Clonar o catálogo para não mutar o objeto estático original
  const catalog = JSON.parse(JSON.stringify(exerciseCatalogStatic)) as ExerciseCategory[]

  catalog.forEach(category => {
    category.exercises.forEach(ex => {
      // Se o exercício tiver o ID da WorkoutAPI mapeado, injetamos a rota proxy da imagem
      if (ex.workoutApiId) {
        ex.imageUrl = `/api/exercises/${ex.workoutApiId}/image`
      }
    })
  })

  return catalog
}
