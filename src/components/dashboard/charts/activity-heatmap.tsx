"use client"

import { useMemo } from "react"

interface HeatmapProps {
  dates: string[] // ISO date strings of activity days
}

export function ActivityHeatmap({ dates }: HeatmapProps) {
  const { weeks, months } = useMemo(() => {
    const today = new Date()
    const oneYearAgo = new Date(today)
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    // Build a set of active dates for O(1) lookup
    const activeSet = new Set(
      dates.map((d) => new Date(d).toISOString().split("T")[0])
    )

    // Generate all days in the past year
    const allWeeks: { date: Date; active: boolean; level: number }[][] = []
    let currentWeek: { date: Date; active: boolean; level: number }[] = []

    const cursor = new Date(oneYearAgo)
    // Start from Sunday
    cursor.setDate(cursor.getDate() - cursor.getDay())

    while (cursor <= today) {
      const dateStr = cursor.toISOString().split("T")[0]
      const isActive = activeSet.has(dateStr)
      currentWeek.push({
        date: new Date(cursor),
        active: isActive,
        level: isActive ? 1 : 0,
      })

      if (currentWeek.length === 7) {
        allWeeks.push(currentWeek)
        currentWeek = []
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    if (currentWeek.length > 0) allWeeks.push(currentWeek)

    // Month labels
    const monthLabels: { label: string; index: number }[] = []
    let lastMonth = -1
    allWeeks.forEach((week, i) => {
      const m = week[0].date.getMonth()
      if (m !== lastMonth) {
        monthLabels.push({
          label: week[0].date.toLocaleDateString("pt-BR", { month: "short" }),
          index: i,
        })
        lastMonth = m
      }
    })

    return { weeks: allWeeks, months: monthLabels }
  }, [dates])

  const totalDays = dates.length

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            {totalDays > 0 ? "🔥" : "❄️"}
          </span>
          <div>
            <span className="text-white font-heading font-bold text-lg">{totalDays} dias</span>
            <p className="text-[10px] text-zinc-500">
              {totalDays > 0
                ? "de atividade no último ano"
                : "Comece uma nova sequência hoje! 💪"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[9px] text-zinc-600">
          <span>Menos</span>
          <div className="w-2.5 h-2.5 rounded-sm bg-white/5 border border-white/5" />
          <div className="w-2.5 h-2.5 rounded-sm bg-primary/30" />
          <div className="w-2.5 h-2.5 rounded-sm bg-primary/60" />
          <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <span>Mais</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="min-w-[700px]">
          {/* Month labels */}
          <div className="flex mb-1 ml-0">
            {months.map((m, i) => (
              <span
                key={i}
                className="text-[9px] text-zinc-600 absolute"
                style={{ left: `${m.index * 13 + 2}px`, position: "relative" }}
              >
                {m.label}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex gap-[3px]">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((day, di) => {
                  const isToday =
                    day.date.toISOString().split("T")[0] ===
                    new Date().toISOString().split("T")[0]
                  return (
                    <div
                      key={di}
                      className={`w-[10px] h-[10px] rounded-[2px] transition-colors ${
                        day.active
                          ? "bg-primary/80 hover:bg-primary"
                          : "bg-white/5 hover:bg-white/10"
                      } ${isToday ? "ring-1 ring-primary/50" : ""}`}
                      title={`${day.date.toLocaleDateString("pt-BR")}${
                        day.active ? " — treinou" : ""
                      }`}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
