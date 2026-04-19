// Catálogo de exercícios organizados por categoria
// Baseado no app mobile GeralGym

export interface Exercise {
  id: string
  name: string
  category: string
  imageUrl?: string
  workoutApiId?: string // UUID da WorkoutAPI para buscar a imagem
}

export interface ExerciseCategory {
  name: string
  exercises: Exercise[]
}

const exerciseCatalog: ExerciseCategory[] = [
  {
    name: "Abdômen",
    exercises: [
      { id: "abd-infra", name: "Abdominal Infra", category: "Abdômen", workoutApiId: "244515cc-c872-472d-a24b-ff0dbd641c0f" },
      { id: "abd-supra", name: "Abdominal Supra", category: "Abdômen", workoutApiId: "d1733069-63bc-4f3b-94da-88ba25766d5d" },
      { id: "abd-obliquo", name: "Abdominal Oblíquo", category: "Abdômen", workoutApiId: "b48ce2bd-7809-4503-a66f-184672ffcbd9" },
      { id: "abd-prancha", name: "Prancha", category: "Abdômen", workoutApiId: "eecd76e5-608c-442e-b12b-ea803a484892" },
      { id: "abd-elevacao-pernas", name: "Elevação de Pernas", category: "Abdômen", workoutApiId: "22abbcd9-0a55-4af0-af6a-c8a5019d6529" },
      { id: "abd-crunch-maquina", name: "Crunch na Máquina", category: "Abdômen", workoutApiId: "cd860ea8-8f4d-4990-8ac6-83b770bc44bf" },
    ]
  },
  {
    name: "Bíceps",
    exercises: [
      { id: "bic-rosca-direta", name: "Rosca Direta", category: "Bíceps", workoutApiId: "f9b987c7-50b1-4e78-abc4-279228eebe38" },
      { id: "bic-rosca-polia-baixa", name: "Rosca Direta Polia Baixa", category: "Bíceps", workoutApiId: "1caf7ff0-8314-4d65-af0b-e94c8e053f10" },
      { id: "bic-rosca-martelo", name: "Rosca Martelo", category: "Bíceps", workoutApiId: "5e04a2a3-e5a0-4821-b22e-e1afbcf0e222" },
      { id: "bic-rosca-alternada", name: "Rosca Alternada", category: "Bíceps", workoutApiId: "37c57fec-6f2b-476f-ad24-bbb6cabaf952" },
      { id: "bic-rosca-scott", name: "Rosca Scott", category: "Bíceps", workoutApiId: "20bdc194-c6c6-49a3-b297-f6dac0738bd1" },
      { id: "bic-rosca-concentrada", name: "Rosca Concentrada", category: "Bíceps" },
      { id: "bic-rosca-inversa", name: "Rosca Inversa", category: "Bíceps", workoutApiId: "bfd5d572-14cc-4ed8-9e8c-f33782ffaf83" },
    ]
  },
  {
    name: "Cardio",
    exercises: [
      { id: "car-esteira", name: "Esteira", category: "Cardio" },
      { id: "car-bicicleta", name: "Bicicleta Ergométrica", category: "Cardio" },
      { id: "car-eliptico", name: "Elíptico", category: "Cardio" },
      { id: "car-escada", name: "Escada (StairMaster)", category: "Cardio" },
      { id: "car-remo", name: "Remo Ergométrico", category: "Cardio" },
      { id: "car-pular-corda", name: "Pular Corda", category: "Cardio" },
    ]
  },
  {
    name: "Core",
    exercises: [
      { id: "core-prancha-lateral", name: "Prancha Lateral", category: "Core", workoutApiId: "b146e8b7-2ead-4a42-ab37-a62699ef089a" },
      { id: "core-roda-abdominal", name: "Roda Abdominal", category: "Core", workoutApiId: "5ce99fba-195b-48ae-8b36-c76f9ae29237" },
      { id: "core-russian-twist", name: "Russian Twist", category: "Core", workoutApiId: "5ea140c6-0c25-4bc2-9683-f31ac356f545" },
      { id: "core-dead-bug", name: "Dead Bug", category: "Core" },
      { id: "core-bird-dog", name: "Bird Dog", category: "Core" },
    ]
  },
  {
    name: "Costas",
    exercises: [
      { id: "cos-puxada-frontal", name: "Puxada Frontal", category: "Costas", workoutApiId: "3f639257-682c-43a7-aefa-7b93161fbc72" },
      { id: "cos-remada-curvada", name: "Remada Curvada", category: "Costas", workoutApiId: "1da42805-c61c-47e4-833e-ef54720f08e3" },
      { id: "cos-remada-baixa", name: "Remada Baixa (Cabo)", category: "Costas", workoutApiId: "4a977484-56d6-4d82-820e-6dd662267515" },
      { id: "cos-remada-unilateral", name: "Remada Unilateral", category: "Costas", workoutApiId: "73714414-48ba-4a45-9ead-759748a9c3e9" },
      { id: "cos-pulldown", name: "Pulldown", category: "Costas", workoutApiId: "933e8655-0c69-4017-a957-43d0b327e987" },
      { id: "cos-barra-fixa", name: "Barra Fixa", category: "Costas", workoutApiId: "42ce6ce3-d63f-494e-92ef-3e60b5c0daaa" },
      { id: "cos-levantamento-terra", name: "Levantamento Terra", category: "Costas", workoutApiId: "4e2e1c7c-c488-4fd9-94e0-44f54e64b199" },
      { id: "cos-face-pull", name: "Face Pull", category: "Costas", workoutApiId: "c5a2e8fa-e490-4a57-8f00-953d2f76ffaa" },
    ]
  },
  {
    name: "Glúteos",
    exercises: [
      { id: "glu-hip-thrust", name: "Hip Thrust", category: "Glúteos" },
      { id: "glu-elevacao-pelvica", name: "Elevação Pélvica", category: "Glúteos" },
      { id: "glu-kickback", name: "Kickback no Cabo", category: "Glúteos" },
      { id: "glu-abdutora", name: "Abdutora", category: "Glúteos", workoutApiId: "a9d12512-f6f2-4c7d-9a64-d5c5e3045375" },
      { id: "glu-agachamento-sumô", name: "Agachamento Sumô", category: "Glúteos", workoutApiId: "f2411065-7d22-407c-bbc6-b861750cfb37" },
      { id: "glu-stiff", name: "Stiff", category: "Glúteos", workoutApiId: "1612fadc-1542-415e-bffc-33c438bce841" },
    ]
  },
  {
    name: "Ombros",
    exercises: [
      { id: "omb-desenvolvimento", name: "Desenvolvimento", category: "Ombros", workoutApiId: "0297b839-e33b-463f-9a27-98c2bae08528" },
      { id: "omb-elevacao-lateral", name: "Elevação Lateral", category: "Ombros", workoutApiId: "871ef6aa-e2f8-4c9c-9cd7-f9fc7863da38" },
      { id: "omb-elevacao-frontal", name: "Elevação Frontal", category: "Ombros", workoutApiId: "d9f415dc-0942-4f4f-b193-f0a711cd7103" },
      { id: "omb-crucifixo-inverso", name: "Crucifixo Inverso", category: "Ombros", workoutApiId: "aca35746-9cd7-4795-9257-ce729183da58" },
      { id: "omb-encolhimento", name: "Encolhimento (Trapézio)", category: "Ombros", workoutApiId: "242e33b3-fdca-4bc3-a04a-c234478a9ec5" },
      { id: "omb-arnold-press", name: "Arnold Press", category: "Ombros", workoutApiId: "08f9941f-9def-4d00-bbce-e8a2ea4ddfa8" },
    ]
  },
  {
    name: "Peito",
    exercises: [
      { id: "pei-supino-reto", name: "Supino Reto", category: "Peito", workoutApiId: "d4c45bd3-40f2-4ca0-b037-d0ba8e4e704d" },
      { id: "pei-supino-inclinado", name: "Supino Inclinado", category: "Peito", workoutApiId: "584d207f-ed88-4ce0-be19-ce8e08c800fb" },
      { id: "pei-supino-declinado", name: "Supino Declinado", category: "Peito", workoutApiId: "4d8dff7c-f4f8-4c17-8180-505d78deb6d2" },
      { id: "pei-crucifixo", name: "Crucifixo", category: "Peito", workoutApiId: "e923474a-4984-4041-a65e-d828e4302b02" },
      { id: "pei-crossover", name: "Crossover", category: "Peito", workoutApiId: "c877640e-11d1-4cd0-bdbc-0a6076e61fd1" },
      { id: "pei-fly-maquina", name: "Fly na Máquina", category: "Peito", workoutApiId: "edb60a2e-5137-42f7-bb5c-6c87550f1cf9" },
      { id: "pei-flexao", name: "Flexão de Braço", category: "Peito", workoutApiId: "f5e3e60d-0137-4ae5-bda1-87122b86393a" },
    ]
  },
  {
    name: "Pernas",
    exercises: [
      { id: "per-agachamento", name: "Agachamento Livre", category: "Pernas", workoutApiId: "474f4f41-7785-4de9-bbed-494170820b6f" },
      { id: "per-leg-press", name: "Leg Press", category: "Pernas", workoutApiId: "d9e4a99d-cd3e-4340-92c0-6ab7d91687fa" },
      { id: "per-cadeira-extensora", name: "Cadeira Extensora", category: "Pernas", workoutApiId: "87633afa-2002-4d88-a1e3-e353849f818e" },
      { id: "per-cadeira-flexora", name: "Cadeira Flexora", category: "Pernas", workoutApiId: "205c8c3a-e20c-4328-8321-5c7eabec6708" },
      { id: "per-hack-squat", name: "Hack Squat", category: "Pernas", workoutApiId: "f8a14e93-51a0-45e3-9229-4c2322687118" },
      { id: "per-afundo", name: "Afundo (Lunge)", category: "Pernas", workoutApiId: "3fdd6b70-e50f-4d18-834f-264ee0dcb2b1" },
      { id: "per-panturrilha", name: "Panturrilha em Pé", category: "Pernas", workoutApiId: "0c04cfac-e901-4221-bcef-06dfbb3898ba" },
      { id: "per-panturrilha-sentado", name: "Panturrilha Sentado", category: "Pernas", workoutApiId: "7819d17b-58b5-412c-85c8-4bf55410abcb" },
      { id: "per-adutora", name: "Adutora", category: "Pernas", workoutApiId: "9b7e453d-84da-49c7-9081-6cf7f8b04aaf" },
    ]
  },
  {
    name: "Tríceps",
    exercises: [
      { id: "tri-triceps-polia", name: "Tríceps na Polia", category: "Tríceps", workoutApiId: "8b222e82-a938-46b8-88c9-44bf0f70f98e" },
      { id: "tri-triceps-testa", name: "Tríceps Testa", category: "Tríceps", workoutApiId: "e75e553b-9627-496f-857d-ee331df35d8c" },
      { id: "tri-triceps-frances", name: "Tríceps Francês", category: "Tríceps", workoutApiId: "8cc54ad6-09ba-43b9-affc-3b819e8e95c2" },
      { id: "tri-triceps-corda", name: "Tríceps na Corda", category: "Tríceps", workoutApiId: "8b222e82-a938-46b8-88c9-44bf0f70f98e" },
      { id: "tri-mergulho", name: "Mergulho (Paralelas)", category: "Tríceps", workoutApiId: "07e91e23-85ef-4798-9e6a-a6c21ee749fa" },
      { id: "tri-kickback", name: "Kickback", category: "Tríceps", workoutApiId: "3117955b-821a-4bf4-915f-3d2b23e61ab4" },
    ]
  },
]

export default exerciseCatalog

// Helper para buscar um exercício pelo ID
export function findExerciseById(id: string): Exercise | undefined {
  for (const category of exerciseCatalog) {
    const exercise = category.exercises.find(e => e.id === id)
    if (exercise) return exercise
  }
  return undefined
}
