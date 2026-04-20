import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { Dumbbell, Flame, Scale, Activity, Timer, Weight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkline } from "@/components/dashboard/charts/sparkline"
import { ActivityHeatmap } from "@/components/dashboard/charts/activity-heatmap"
import { WeeklyHoursChart, MonthlyHoursChart, CaloriesWeekChart, MonthlyVolumeChart } from "@/components/dashboard/charts/workout-charts"
import { WeightChart } from "@/components/dashboard/charts/progress-charts"

// ============================================================
// Helpers
// ============================================================

function calculateIMC(weight: number, heightM: number): { value: number; label: string; color: string } {
  const imc = weight / (heightM * heightM)
  let label = ""
  let color = ""
  if (imc < 18.5) { label = "Abaixo"; color = "text-blue-400" }
  else if (imc < 25) { label = "Normal"; color = "text-green-400" }
  else if (imc < 30) { label = "Sobrepeso"; color = "text-yellow-400" }
  else if (imc < 35) { label = "Obesidade"; color = "text-orange-400" }
  else { label = "Obesidade Grave"; color = "text-red-400" }
  return { value: parseFloat(imc.toFixed(1)), label, color }
}

function getWeekLabel(date: Date): string {
  const start = new Date(date)
  start.setDate(start.getDate() - start.getDay())
  return start.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString("pt-BR", { month: "short" })
}

interface ExerciseJson {
  sets?: number;
  reps?: string;
  weight?: number;
}

function calculateWorkoutVolume(exercisesJson: any): number {
  if (!exercisesJson) return 0;
  try {
    let exercises = exercisesJson;
    if (typeof exercises === 'string') exercises = JSON.parse(exercises);
    if (!Array.isArray(exercises)) return 0;
    
    return exercises.reduce((acc: number, ex: ExerciseJson) => {
      const sets = ex.sets || 0;
      const repsStr = ex.reps || "1";
      const repsMatch = repsStr.match(/\d+/);
      const reps = repsMatch ? parseInt(repsMatch[0], 10) : 1;
      const weight = ex.weight || 0;
      return acc + (sets * Math.max(1, reps) * weight);
    }, 0);
  } catch {
    return 0;
  }
}

// ============================================================
// Page
// ============================================================

export default async function DashboardPage({ params }: { params: Promise<{ gymSlug: string }> }) {
  const { gymSlug } = await params
  const session = await auth()
  if (!session?.user) redirect("/login")

  const userId = session.user.id
  const user = session.user as any

  let gymId: string | null = null
  let resolvedGymSlug = gymSlug

  if (gymSlug !== "me") {
    const gym = await prisma.gym.findUnique({ where: { slug: gymSlug } })
    if (!gym) redirect("/me/dashboard")
    gymId = gym.id
  } else if (user.gymId) {
    // Se estiver em /me mas tiver uma academia vinculada, busca o slug dela
    const gym = await prisma.gym.findUnique({ 
      where: { id: user.gymId },
      select: { slug: true, id: true }
    })
    if (gym) {
      resolvedGymSlug = gym.slug
      gymId = gym.id
    }
  }

  // ---------- Aggregations ----------
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [
    workoutsCount,
    monthlyWorkouts,
    allWorkouts,
    caloriesAgg,
    recentMeasurements,
  ] = await Promise.all([
    prisma.workout.count({ where: { userId, gymId, isTemplate: false } }),
    prisma.workout.findMany({
      where: { userId, gymId, isTemplate: false, performedAt: { gte: startOfMonth } },
      select: { durationMinutes: true, caloriesBurned: true, exercises: true },
    }),
    prisma.workout.findMany({
      where: { userId, gymId, isTemplate: false },
      orderBy: { performedAt: "asc" },
      select: { performedAt: true, durationMinutes: true, caloriesBurned: true, exercises: true },
    }),
    prisma.workout.aggregate({
      _sum: { caloriesBurned: true },
      where: { userId, gymId, isTemplate: false },
    }),
    prisma.measurement.findMany({
      where: { userId, gymId },
      orderBy: { measuredAt: "asc" },
      select: { weight: true, bodyFat: true, measuredAt: true, measurements: true },
    }),
  ])

  // ---------- Derived stats ----------
  const totalCalories = caloriesAgg._sum?.caloriesBurned ?? 0

  // Monthly stats
  const monthlyTrainingCount = monthlyWorkouts.length
  const monthlyMinutes = monthlyWorkouts.reduce((acc, w) => acc + (w.durationMinutes ?? 0), 0)
  const monthlyCalories = monthlyWorkouts.reduce((acc, w) => acc + (w.caloriesBurned ?? 0), 0)
  const monthlyVolume = monthlyWorkouts.reduce((acc, w) => acc + calculateWorkoutVolume(w.exercises), 0)

  // Last measurement
  const lastMeasurement = recentMeasurements.length > 0
    ? recentMeasurements[recentMeasurements.length - 1]
    : null

  // IMC
  const lastDetails = lastMeasurement?.measurements as Record<string, number> | null
  const heightM = lastDetails?.height || 0
  const imc = lastMeasurement && heightM > 0
    ? calculateIMC(lastMeasurement.weight, heightM)
    : null

  // Activity dates for heatmap
  const activityDates = allWorkouts.map((w) => w.performedAt.toISOString())

  // Sparkline data
  const weightData = recentMeasurements.map((m) => ({
    date: new Date(m.measuredAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
    value: m.weight,
  }))
  const bfData = recentMeasurements
    .filter((m) => m.bodyFat !== null)
    .map((m) => ({
      date: new Date(m.measuredAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }),
      value: m.bodyFat!,
    }))

  // Weekly hours (last 8 weeks)
  const weeklyMap = new Map<string, number>()
  allWorkouts.forEach((w) => {
    const label = getWeekLabel(w.performedAt)
    weeklyMap.set(label, (weeklyMap.get(label) || 0) + (w.durationMinutes ?? 0) / 60)
  })
  const weeklyHoursData = Array.from(weeklyMap.entries())
    .slice(-8)
    .map(([week, hours]) => ({ week, hours: parseFloat(hours.toFixed(1)) }))

  // Monthly hours (last 6 months)
  const monthlyMap = new Map<string, number>()
  const monthlyVolumeMap = new Map<string, number>()
  allWorkouts.forEach((w) => {
    const label = getMonthLabel(w.performedAt)
    monthlyMap.set(label, (monthlyMap.get(label) || 0) + (w.durationMinutes ?? 0) / 60)
    monthlyVolumeMap.set(label, (monthlyVolumeMap.get(label) || 0) + calculateWorkoutVolume(w.exercises))
  })
  const monthlyHoursData = Array.from(monthlyMap.entries())
    .slice(-6)
    .map(([month, hours]) => ({ month, hours: parseFloat(hours.toFixed(1)) }))
  const monthlyVolumeData = Array.from(monthlyVolumeMap.entries())
    .slice(-6)
    .map(([month, volume]) => ({ month, volume }))

  // Calories last 7 days
  const last7DaysWorkouts = allWorkouts.filter((w) => w.performedAt >= sevenDaysAgo)
  const dailyCaloriesMap = new Map<string, number>()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    dailyCaloriesMap.set(
      d.toLocaleDateString("pt-BR", { weekday: "short" }),
      0
    )
  }
  last7DaysWorkouts.forEach((w) => {
    const dayLabel = w.performedAt.toLocaleDateString("pt-BR", { weekday: "short" })
    if (dailyCaloriesMap.has(dayLabel)) {
      dailyCaloriesMap.set(dayLabel, (dailyCaloriesMap.get(dayLabel) || 0) + (w.caloriesBurned || 0))
    }
  })
  const caloriesWeekData = Array.from(dailyCaloriesMap.entries()).map(([day, calories]) => ({
    day,
    calories,
  }))

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header com Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Avatar"}
              width={80}
              height={80}
              className="rounded-full border-2 border-primary/30 shadow-lg shadow-primary/10"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-zinc-800 border-2 border-white/10 flex items-center justify-center">
              <span className="text-2xl font-heading font-bold text-zinc-400">
                {(user.name || "A").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-zinc-950">
            <span className="text-[10px]">📷</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">
              {user.name || "Atleta"}
            </h1>
            <p className="text-zinc-500 text-sm">
              @{user.email?.split("@")[0] || "usuario"}
            </p>
          </div>
          
          {(user.role === "ADMIN" || user.role === "COACH") && (
            <Link 
              href={resolvedGymSlug === "me" ? "/admin" : `/${resolvedGymSlug}/admin`}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2 transition-all group"
            >
              <div className="p-1 bg-primary/20 rounded group-hover:bg-primary/30 transition-colors">
                <Flame className="w-4 h-4 text-primary" />
              </div>
              Painel Administrativo
            </Link>
          )}
        </div>
      </div>

      {/* Stats Row: Peso, Altura, IMC */}
      {lastMeasurement && (
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
          <div className="flex items-center justify-center gap-6 sm:gap-10 flex-wrap">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Peso</p>
              <p className="text-xl font-heading font-bold text-white">{lastMeasurement.weight} kg</p>
            </div>
            {heightM > 0 && (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Altura</p>
                <p className="text-xl font-heading font-bold text-white">{heightM} m</p>
              </div>
            )}
            {imc && (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">IMC</p>
                <p className={`text-2xl font-heading font-bold ${imc.color}`}>{imc.value}</p>
                <p className={`text-[10px] ${imc.color}`}>{imc.label}</p>
              </div>
            )}
            {lastMeasurement.bodyFat && (
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">BF</p>
                <p className="text-xl font-heading font-bold text-white">{lastMeasurement.bodyFat}%</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estatísticas do Mês */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4 text-center">Estatísticas do Mês</h3>
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <Dumbbell className="w-5 h-5 text-primary mx-auto mb-1 opacity-60" />
            <p className="text-lg font-heading font-bold text-white">{monthlyTrainingCount}</p>
            <p className="text-[10px] text-zinc-500">Treinos</p>
          </div>
          <div>
            <Weight className="w-5 h-5 text-primary mx-auto mb-1 opacity-60" />
            <p className="text-lg font-heading font-bold text-white">{monthlyVolume} kg</p>
            <p className="text-[10px] text-zinc-500">Volume</p>
          </div>
          <div>
            <Timer className="w-5 h-5 text-primary mx-auto mb-1 opacity-60" />
            <p className="text-lg font-heading font-bold text-white">{monthlyMinutes}m</p>
            <p className="text-[10px] text-zinc-500">Tempo</p>
          </div>
          <div>
            <Flame className="w-5 h-5 text-primary mx-auto mb-1 opacity-60" />
            <p className="text-lg font-heading font-bold text-white">{Math.round(monthlyCalories)} kcal</p>
            <p className="text-[10px] text-zinc-500">Calorias</p>
          </div>
        </div>
      </div>

      {/* Atividade (Heatmap) */}
      <div className="bg-black/20 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Atividade no último ano</h3>
        <ActivityHeatmap dates={activityDates} />
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Evolução do Peso */}
        <div className="bg-black/30 border border-white/5 rounded-2xl p-5 backdrop-blur-md md:col-span-2">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Evolução do Peso
          </h3>
          {recentMeasurements.length >= 2 ? (
            <WeightChart data={JSON.parse(JSON.stringify(recentMeasurements))} />
          ) : (
            <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
              Registre o peso mais de uma vez para ver a evolução.
            </div>
          )}
        </div>

        {/* Horas de Treino por Semana */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Timer className="w-4 h-4 text-primary" />
            Horas de Treino por Semana
          </h3>
          <WeeklyHoursChart data={weeklyHoursData} />
        </div>

        {/* Horas de Treino por Mês */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Timer className="w-4 h-4 text-blue-400" />
            Horas de Treino por Mês
          </h3>
          <MonthlyHoursChart data={monthlyHoursData} />
        </div>

        {/* Volume Mensal */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-md">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Weight className="w-4 h-4 text-purple-500" />
            Volume Mensal (kg)
          </h3>
          <MonthlyVolumeChart data={monthlyVolumeData} />
        </div>

        {/* Calorias Perdidas (7 Dias) */}
        <div className="bg-black/30 border border-white/5 rounded-xl p-5 backdrop-blur-md md:col-span-2">
          <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            Calorias Perdidas (7 Dias)
          </h3>
          <CaloriesWeekChart data={caloriesWeekData} />
        </div>
      </div>

      {/* Quick stat cards (bottom) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Total de Treinos</CardTitle>
            <Dumbbell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-white">{workoutsCount}</div>
            <p className="text-xs text-zinc-500 mt-1">sessões registradas</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Calorias Totais</CardTitle>
            <Flame className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-white">{Math.floor(totalCalories)}</div>
            <p className="text-xs text-zinc-500 mt-1">kcal estimadas</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">Último Peso</CardTitle>
            <Scale className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-white">
              {lastMeasurement ? `${lastMeasurement.weight} kg` : "--"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {lastMeasurement ? new Date(lastMeasurement.measuredAt).toLocaleDateString("pt-BR") : "Nenhum registro"}
            </p>
            <Sparkline data={weightData} color="#f97316" unit="kg" />
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">% Gordura (BF)</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-white">
              {lastMeasurement?.bodyFat ? `${lastMeasurement.bodyFat}%` : "--"}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {lastMeasurement?.bodyFat ? "Bom progresso" : "Atualize suas medidas"}
            </p>
            <Sparkline data={bfData} color="#ef4444" unit="%" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
