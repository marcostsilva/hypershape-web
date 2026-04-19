import * as z from "zod"

// Esquema simplificado de exercício inserido no treino
const ExerciseSchema = z.object({
  name: z.string().min(1, "O nome do exercício é obrigatório"),
  sets: z.number().min(1).optional(),
  reps: z.string().optional(), // Pode ser "10-12" ou "falha"
  weight: z.number().optional(), // Carga em kg
  notes: z.string().optional()
})

// Schema de Criação de Treino (Workout)
export const CreateWorkoutSchema = z.object({
  name: z.string().min(2, "O nome do treino deve ter pelo menos 2 caracteres"),
  durationMinutes: z.coerce.number().min(1, "Duração deve ser pelo menos 1 minuto"),
  caloriesBurned: z.coerce.number().optional(),
  performedAt: z.string().transform((str) => new Date(str)),
  // Opcional para o form MVP, ou injetado depois
  exercises: z.array(ExerciseSchema).default([]) 
})

export type CreateWorkoutInput = z.infer<typeof CreateWorkoutSchema>

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
