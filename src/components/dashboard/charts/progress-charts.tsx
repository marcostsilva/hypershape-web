"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"

// ============================================================
// Types
// ============================================================

interface MeasurementRecord {
  id: string
  weight: number
  bodyFat: number | null
  measuredAt: Date | string
  measurements: Record<string, number> | null
}

interface WeightChartProps {
  data: MeasurementRecord[]
}

interface CircumferenceChartProps {
  data: MeasurementRecord[]
  fields: { key: string; label: string; color: string }[]
  title: string
}

// ============================================================
// Shared Tooltip Style
// ============================================================

const tooltipStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "10px 14px",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
}

const tooltipLabelStyle = {
  color: "rgba(255, 255, 255, 0.5)",
  fontSize: "10px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  marginBottom: "4px",
}

const tooltipItemStyle = {
  fontSize: "12px",
  fontWeight: 600,
}

// ============================================================
// Helper
// ============================================================

function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })
}

// ============================================================
// Weight + BF Chart
// ============================================================

export function WeightChart({ data }: WeightChartProps) {
  const sorted = [...data]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())

  const chartData = sorted.map((r) => ({
    date: formatDate(r.measuredAt),
    peso: r.weight,
    bf: r.bodyFat || undefined,
  }))

  const hasBF = chartData.some((d) => d.bf !== undefined)

  if (chartData.length < 2) {
    return (
      <div className="flex items-center justify-center h-48 text-zinc-500 text-sm">
        Registre pelo menos 2 avaliações para ver o gráfico.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
        <defs>
          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#39FF14" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#39FF14" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="bfGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="date"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
          axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="weight"
          tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          domain={["auto", "auto"]}
        />
        {hasBF && (
          <YAxis
            yAxisId="bf"
            orientation="right"
            tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 40]}
          />
        )}
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
          cursor={{ stroke: "rgba(255,255,255,0.1)" }}
        />
        <Area
          yAxisId="weight"
          type="monotone"
          dataKey="peso"
          stroke="#39FF14"
          strokeWidth={2.5}
          fill="url(#weightGradient)"
          dot={{ fill: "#39FF14", strokeWidth: 0, r: 3 }}
          activeDot={{ r: 5, fill: "#39FF14", stroke: "#000", strokeWidth: 2 }}
          name="Peso (kg)"
        />
        {hasBF && (
          <Area
            yAxisId="bf"
            type="monotone"
            dataKey="bf"
            stroke="#FF6B6B"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            fill="url(#bfGradient)"
            dot={{ fill: "#FF6B6B", strokeWidth: 0, r: 2 }}
            name="BF (%)"
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ============================================================
// Circumference Comparison Chart
// ============================================================

export function CircumferenceChart({ data, fields, title }: CircumferenceChartProps) {
  const sorted = [...data]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())

  const chartData = sorted
    .map((r) => {
      const m = r.measurements || {}
      const entry: Record<string, string | number | undefined> = {
        date: formatDate(r.measuredAt),
      }
      let hasAny = false
      for (const f of fields) {
        if (m[f.key]) {
          entry[f.key] = m[f.key]
          hasAny = true
        }
      }
      return hasAny ? entry : null
    })
    .filter(Boolean)

  if (chartData.length < 2) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-600 text-xs">
        Dados insuficientes para "{title}".
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-3 ml-1">{title}</h4>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="date"
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelStyle={tooltipLabelStyle}
            itemStyle={tooltipItemStyle}
            cursor={{ stroke: "rgba(255,255,255,0.1)" }}
          />
          {fields.map((f) => (
            <Line
              key={f.key}
              type="monotone"
              dataKey={f.key}
              stroke={f.color}
              strokeWidth={2}
              dot={{ fill: f.color, strokeWidth: 0, r: 2.5 }}
              activeDot={{ r: 4, fill: f.color, stroke: "#000", strokeWidth: 2 }}
              name={f.label}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================
// Pre-configured chart groups
// ============================================================

const armFields = [
  { key: "armRight", label: "Braço Dir", color: "#60A5FA" },
  { key: "armLeft", label: "Braço Esq", color: "#93C5FD" },
]

const legFields = [
  { key: "thighRight", label: "Coxa Dir", color: "#F59E0B" },
  { key: "thighLeft", label: "Coxa Esq", color: "#FCD34D" },
  { key: "calfRight", label: "Panturrilha Dir", color: "#FB923C" },
  { key: "calfLeft", label: "Panturrilha Esq", color: "#FDBA74" },
]

const torsoFields = [
  { key: "chest", label: "Peitoral", color: "#A78BFA" },
  { key: "waist", label: "Cintura", color: "#F472B6" },
  { key: "hips", label: "Quadril", color: "#FB7185" },
  { key: "glutes", label: "Glúteos", color: "#E879F9" },
  { key: "neck", label: "Pescoço", color: "#C4B5FD" },
]

export function ProgressCharts({ data }: { data: MeasurementRecord[] }) {
  return (
    <div className="space-y-6">
      {/* Peso + BF */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
        <h3 className="text-sm font-heading font-bold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
          Peso & Composição Corporal
        </h3>
        <WeightChart data={data} />
      </div>

      {/* Circumferences */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        <div className="bg-black/30 border border-white/5 rounded-xl p-4 backdrop-blur-md">
          <CircumferenceChart data={data} fields={armFields} title="Braços" />
        </div>
        <div className="bg-black/30 border border-white/5 rounded-xl p-4 backdrop-blur-md">
          <CircumferenceChart data={data} fields={legFields} title="Pernas" />
        </div>
        <div className="bg-black/30 border border-white/5 rounded-xl p-4 backdrop-blur-md md:col-span-2 lg:col-span-1 xl:col-span-2">
          <CircumferenceChart data={data} fields={torsoFields} title="Tronco" />
        </div>
      </div>
    </div>
  )
}
