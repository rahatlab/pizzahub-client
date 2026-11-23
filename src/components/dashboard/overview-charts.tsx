"use client"

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { ORDER_STATUS_LABELS } from "@/lib/constants"
import type { CategoryCount, StatusCount } from "@/types/dashboard"

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
}

export function OrdersStatusChart({ data }: { data: StatusCount[] }) {
  const chartData = data.map((row) => ({
    name: ORDER_STATUS_LABELS[row.status] ?? row.status,
    count: row.count,
  }))

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <YAxis
            allowDecimals={false}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
          />
          <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="var(--chart-1)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ItemsCategoryChart({ data }: { data: CategoryCount[] }) {
  const chartData = data.filter((row) => row.count > 0)

  if (chartData.length === 0) {
    return (
      <div className="grid h-[240px] place-items-center text-sm text-muted-foreground">
        No items yet
      </div>
    )
  }

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="category"
            innerRadius={56}
            outerRadius={90}
            paddingAngle={2}
            stroke="var(--card)"
          >
            {chartData.map((row, index) => (
              <Cell
                key={row.category}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CategoryLegend({ data }: { data: CategoryCount[] }) {
  return (
    <ul className="space-y-1.5">
      {data.map((row, index) => (
        <li
          key={row.category}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <span
              className="size-2 shrink-0 rounded-full"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
            />
            <span className="truncate">{row.category}</span>
          </span>
          <span className="tabular-nums">{row.count}</span>
        </li>
      ))}
    </ul>
  )
}
