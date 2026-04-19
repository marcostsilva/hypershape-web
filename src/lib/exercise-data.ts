// Catálogo de exercícios organizados por categoria
// Baseado no app mobile GeralGym

export interface Exercise {
  id: string
  name: string
  category: string
  imageUrl?: string
}

export interface ExerciseCategory {
  name: string
  exercises: Exercise[]
}

const exerciseCatalog: ExerciseCategory[] = [
  {
    name: "Abdômen",
    exercises: [
      { id: "abd-infra", name: "Abdominal Infra", category: "Abdômen" },
      { id: "abd-supra", name: "Abdominal Supra", category: "Abdômen" },
      { id: "abd-obliquo", name: "Abdominal Oblíquo", category: "Abdômen" },
      { id: "abd-prancha", name: "Prancha", category: "Abdômen" },
      { id: "abd-elevacao-pernas", name: "Elevação de Pernas", category: "Abdômen" },
      { id: "abd-crunch-maquina", name: "Crunch na Máquina", category: "Abdômen" },
    ]
  },
  {
    name: "Bíceps",
    exercises: [
      { id: "bic-rosca-direta", name: "Rosca Direta", category: "Bíceps" },
      { id: "bic-rosca-polia-baixa", name: "Rosca Direta Polia Baixa", category: "Bíceps" },
      { id: "bic-rosca-martelo", name: "Rosca Martelo", category: "Bíceps" },
      { id: "bic-rosca-alternada", name: "Rosca Alternada", category: "Bíceps" },
      { id: "bic-rosca-scott", name: "Rosca Scott", category: "Bíceps" },
      { id: "bic-rosca-concentrada", name: "Rosca Concentrada", category: "Bíceps" },
      { id: "bic-rosca-inversa", name: "Rosca Inversa", category: "Bíceps" },
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
      { id: "core-prancha-lateral", name: "Prancha Lateral", category: "Core" },
      { id: "core-roda-abdominal", name: "Roda Abdominal", category: "Core" },
      { id: "core-russian-twist", name: "Russian Twist", category: "Core" },
      { id: "core-dead-bug", name: "Dead Bug", category: "Core" },
      { id: "core-bird-dog", name: "Bird Dog", category: "Core" },
    ]
  },
  {
    name: "Costas",
    exercises: [
      { id: "cos-puxada-frontal", name: "Puxada Frontal", category: "Costas" },
      { id: "cos-remada-curvada", name: "Remada Curvada", category: "Costas" },
      { id: "cos-remada-baixa", name: "Remada Baixa (Cabo)", category: "Costas" },
      { id: "cos-remada-unilateral", name: "Remada Unilateral", category: "Costas" },
      { id: "cos-pulldown", name: "Pulldown", category: "Costas" },
      { id: "cos-barra-fixa", name: "Barra Fixa", category: "Costas" },
      { id: "cos-levantamento-terra", name: "Levantamento Terra", category: "Costas" },
      { id: "cos-face-pull", name: "Face Pull", category: "Costas" },
    ]
  },
  {
    name: "Glúteos",
    exercises: [
      { id: "glu-hip-thrust", name: "Hip Thrust", category: "Glúteos" },
      { id: "glu-elevacao-pelvica", name: "Elevação Pélvica", category: "Glúteos" },
      { id: "glu-kickback", name: "Kickback no Cabo", category: "Glúteos" },
      { id: "glu-abdutora", name: "Abdutora", category: "Glúteos" },
      { id: "glu-agachamento-sumô", name: "Agachamento Sumô", category: "Glúteos" },
      { id: "glu-stiff", name: "Stiff", category: "Glúteos" },
    ]
  },
  {
    name: "Ombros",
    exercises: [
      { id: "omb-desenvolvimento", name: "Desenvolvimento", category: "Ombros" },
      { id: "omb-elevacao-lateral", name: "Elevação Lateral", category: "Ombros" },
      { id: "omb-elevacao-frontal", name: "Elevação Frontal", category: "Ombros" },
      { id: "omb-crucifixo-inverso", name: "Crucifixo Inverso", category: "Ombros" },
      { id: "omb-encolhimento", name: "Encolhimento (Trapézio)", category: "Ombros" },
      { id: "omb-arnold-press", name: "Arnold Press", category: "Ombros" },
    ]
  },
  {
    name: "Peito",
    exercises: [
      { id: "pei-supino-reto", name: "Supino Reto", category: "Peito" },
      { id: "pei-supino-inclinado", name: "Supino Inclinado", category: "Peito" },
      { id: "pei-supino-declinado", name: "Supino Declinado", category: "Peito" },
      { id: "pei-crucifixo", name: "Crucifixo", category: "Peito" },
      { id: "pei-crossover", name: "Crossover", category: "Peito" },
      { id: "pei-fly-maquina", name: "Fly na Máquina", category: "Peito" },
      { id: "pei-flexao", name: "Flexão de Braço", category: "Peito" },
    ]
  },
  {
    name: "Pernas",
    exercises: [
      { id: "per-agachamento", name: "Agachamento Livre", category: "Pernas" },
      { id: "per-leg-press", name: "Leg Press", category: "Pernas" },
      { id: "per-cadeira-extensora", name: "Cadeira Extensora", category: "Pernas" },
      { id: "per-cadeira-flexora", name: "Cadeira Flexora", category: "Pernas" },
      { id: "per-hack-squat", name: "Hack Squat", category: "Pernas" },
      { id: "per-afundo", name: "Afundo (Lunge)", category: "Pernas" },
      { id: "per-panturrilha", name: "Panturrilha em Pé", category: "Pernas" },
      { id: "per-panturrilha-sentado", name: "Panturrilha Sentado", category: "Pernas" },
      { id: "per-adutora", name: "Adutora", category: "Pernas" },
    ]
  },
  {
    name: "Tríceps",
    exercises: [
      { id: "tri-triceps-polia", name: "Tríceps na Polia", category: "Tríceps" },
      { id: "tri-triceps-testa", name: "Tríceps Testa", category: "Tríceps" },
      { id: "tri-triceps-frances", name: "Tríceps Francês", category: "Tríceps" },
      { id: "tri-triceps-corda", name: "Tríceps na Corda", category: "Tríceps" },
      { id: "tri-mergulho", name: "Mergulho (Paralelas)", category: "Tríceps" },
      { id: "tri-kickback", name: "Kickback", category: "Tríceps" },
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
