import * as z from "zod"

// Esquema de exercício com configuração de séries/repetições/carga
const ExerciseSchema = z.object({
  id: z.string().min(1, "ID do exercício é obrigatório"),
  name: z.string().min(1, "O nome do exercício é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  sets: z.number().min(1, "Mínimo 1 série").default(3),
  reps: z.string().default("12"),   // Pode ser "10-12", "falha", "30s", etc.
  weight: z.number().optional(),    // Carga em kg
  imageUrl: z.string().optional(),
  notes: z.string().optional()
})

export type ExerciseInput = z.infer<typeof ExerciseSchema>

// Schema de Criação de Treino — apenas nome e data
export const CreateWorkoutSchema = z.object({
  name: z.string().min(2, "O nome do treino deve ter pelo menos 2 caracteres"),
  performedAt: z.string().transform((str) => new Date(str)),
})

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>

// Schema para atualizar exercícios de um treino
export const UpdateWorkoutExercisesSchema = z.object({
  workoutId: z.string().min(1),
  exercises: z.array(ExerciseSchema),
})

export type UpdateWorkoutExercisesInput = z.infer<typeof UpdateWorkoutExercisesSchema>

// Schema das medidas detalhadas do corpo (Json field no DB)
// Compatível com o app mobile: inclui lateralidade Dir/Esq
export const DetailedMeasurementsSchema = z.object({
  height: z.coerce.number().optional(),          // Altura (m)
  chest: z.coerce.number().optional(),            // Peitoral (cm)
  neck: z.coerce.number().optional(),             // Pescoço (cm)
  waist: z.coerce.number().optional(),            // Cintura (cm)
  hips: z.coerce.number().optional(),             // Quadril (cm)
  glutes: z.coerce.number().optional(),           // Glúteos (cm)
  armRight: z.coerce.number().optional(),         // Braço Dir (cm)
  armLeft: z.coerce.number().optional(),          // Braço Esq (cm)
  thighRight: z.coerce.number().optional(),       // Coxa Dir (cm)
  thighLeft: z.coerce.number().optional(),        // Coxa Esq (cm)
  calfRight: z.coerce.number().optional(),        // Panturrilha Dir (cm)
  calfLeft: z.coerce.number().optional(),         // Panturrilha Esq (cm)
})

// Schema de Criação de Medidas (Measurement)
export const CreateMeasurementSchema = z.object({
  weight: z.coerce.number().min(20, "Peso inválido"),
  bodyFat: z.coerce.number().min(1).max(100).optional(),
  measuredAt: z.string().transform((str) => new Date(str)),
  measurements: DetailedMeasurementsSchema.default({})
})

export type CreateMeasurementInput = z.infer<typeof CreateMeasurementSchema>
