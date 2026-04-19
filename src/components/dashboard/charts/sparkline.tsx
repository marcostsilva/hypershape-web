"use client"

import { AreaChart, Area, ResponsiveContainer, Tooltip } from "recharts"

interface SparklineProps {
  data: { date: string; value: number }[]
  color?: string
  unit?: string
}

export function Sparkline({ data, color = "#39FF14", unit = "kg" }: SparklineProps) {
  if (data.length < 2) return null

  return (
    <div className="mt-3 -mx-2 -mb-2">
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.9)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              padding: "6px 10px",
              fontSize: "11px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.5)", fontSize: "9px" }}
            formatter={(value: number) => [`${value} ${unit}`, ""]}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#spark-${color.replace("#", "")})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "#000", strokeWidth: 1.5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
