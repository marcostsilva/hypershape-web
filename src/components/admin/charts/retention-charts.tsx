"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts"

interface RetentionData {
  month: string
  active: number
  inactive: number
}

interface RetentionChartsProps {
  data: RetentionData[]
  statusDistribution: { name: string; value: number; color: string }[]
}

const tooltipStyle = {
  backgroundColor: "rgba(0, 0, 0, 0.85)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "12px",
  padding: "10px 14px",
}

export function RetentionCharts({ data, statusDistribution }: RetentionChartsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Crescimento de Alunos */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-sm font-heading font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          Crescimento de Alunos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis 
              dataKey="month" 
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.05)" }} />
            <Bar dataKey="active" name="Ativos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="inactive" name="Inativos" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.3} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Distribuição de Status */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
        <h3 className="text-sm font-heading font-bold text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Distribuição de Status
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusDistribution}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {statusDistribution.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {statusDistribution.map((item) => (
            <div key={item.name} className="text-center">
              <p className="text-[10px] text-zinc-500 uppercase font-bold">{item.name}</p>
              <p className="text-lg font-black text-white" style={{ color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
