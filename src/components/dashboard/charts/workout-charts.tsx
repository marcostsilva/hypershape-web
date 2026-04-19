"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"

// ============================================================
// Shared styles
// ============================================================

const tooltipStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "8px 12px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
}

const tooltipLabelStyle = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  marginBottom: "2px",
}

const axisTickStyle = { fill: "rgba(255,255,255,0.4)", fontSize: 10 }

// ============================================================
// Horas de Treino por Semana
// ============================================================

interface WeeklyHoursProps {
  data: { week: string; hours: number }[]
}

export function WeeklyHoursChart({ data }: WeeklyHoursProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
        Nenhum treino registrado ainda.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="week" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: number) => [`${value.toFixed(1)}h`, "Horas"]}
        />
        <Bar
          dataKey="hours"
          fill="#39FF14"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
          fillOpacity={0.8}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// Horas de Treino por Mês
// ============================================================

interface MonthlyHoursProps {
  data: { month: string; hours: number }[]
}

export function MonthlyHoursChart({ data }: MonthlyHoursProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
        Nenhum treino registrado ainda.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: number) => [`${value.toFixed(1)}h`, "Horas"]}
        />
        <Bar
          dataKey="hours"
          fill="#60A5FA"
          radius={[4, 4, 0, 0]}
          maxBarSize={50}
          fillOpacity={0.8}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// Calorias Perdidas (7 Dias)
// ============================================================

interface CaloriesWeekProps {
  data: { day: string; calories: number }[]
}

export function CaloriesWeekChart({ data }: CaloriesWeekProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
        Nenhuma caloria gasta registrada ainda.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="caloriesGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: number) => [`${Math.round(value)} kcal`, "Calorias"]}
        />
        <Area
          type="monotone"
          dataKey="calories"
          stroke="#F59E0B"
          strokeWidth={2}
          fill="url(#caloriesGrad)"
          dot={{ fill: "#F59E0B", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#F59E0B", stroke: "#000", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
