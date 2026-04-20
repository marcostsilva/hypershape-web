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
        <defs>
          <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f97316" stopOpacity={1} />
            <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="week" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: any) => [`${value?.toFixed(1) || 0}h`, "Horas"]}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar
          dataKey="hours"
          fill="url(#primaryGrad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
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
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
            <stop offset="100%" stopColor="#2563eb" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: any) => [`${value?.toFixed(1) || 0}h`, "Horas"]}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar
          dataKey="hours"
          fill="url(#blueGrad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={50}
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
            <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="day" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: any) => [`${Math.round(value || 0)} kcal`, "Calorias"]}
        />
        <Area
          type="monotone"
          dataKey="calories"
          stroke="#f59e0b"
          strokeWidth={3}
          fill="url(#caloriesGrad)"
          dot={{ fill: "#f59e0b", strokeWidth: 2, stroke: "#18181b", r: 4 }}
          activeDot={{ r: 6, fill: "#f59e0b", stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// Volume de Treino por Mês (kg)
// ============================================================

interface MonthlyVolumeProps {
  data: { month: string; volume: number }[]
}

export function MonthlyVolumeChart({ data }: MonthlyVolumeProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
        Nenhum volume registrado ainda.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" stopOpacity={1} />
            <stop offset="100%" stopColor="#7e22ce" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" tick={axisTickStyle} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} tickLine={false} />
        <YAxis tick={axisTickStyle} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          formatter={(value: any) => [`${value || 0} kg`, "Volume"]}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar
          dataKey="volume"
          fill="url(#purpleGrad)"
          radius={[6, 6, 0, 0]}
          maxBarSize={50}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
