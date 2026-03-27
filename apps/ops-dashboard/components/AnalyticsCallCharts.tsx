'use client'

import {
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'

const tooltipStyle = {
  backgroundColor: '#1c1c1f',
  border: '1px solid #3f3f46',
  borderRadius: 10,
  color: '#fff',
}
const tooltipItemStyle = { color: '#a1a1aa', fontSize: 13 }
const tooltipLabelStyle = { color: '#fff', fontWeight: 600, marginBottom: 4 }

const hideZero = (v: number): string => v === 0 ? '' : String(v)

function fmtMonthShort(value: string) {
  const [, month] = value.split('-')
  return new Date(2000, Number(month) - 1).toLocaleString('en-GB', { month: 'short' })
}
function fmtMonthLong(value: string) {
  const [year, month] = value.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

/* ── Area chart ─────────────────────────────────────────────── */
export function AreaChartWidget({
  title,
  data,
  series,
  delay = 0,
}: {
  title: string
  data: Record<string, unknown>[]
  series: Array<{ key: string; name: string; color: string }>
  delay?: number
}) {
  return (
    <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
          <XAxis dataKey="month" tickFormatter={fmtMonthShort} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={hideZero} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} labelFormatter={fmtMonthLong} separator=": " />
          {series.map((s) => (
            <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} fill={`url(#grad-${s.key})`} animationDuration={1000} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Bar chart ──────────────────────────────────────────────── */
export function BarChartWidget({
  title,
  data,
  dataKey,
  labelKey,
  color,
  delay = 0,
}: {
  title: string
  data: Record<string, unknown>[]
  dataKey: string
  labelKey: string
  color: string
  delay?: number
}) {
  return (
    <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <defs>
            <linearGradient id={`barGrad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
              <stop offset="100%" stopColor={color} stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis dataKey={labelKey} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={hideZero} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} separator=": " cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey={dataKey} name="Calls" radius={[4, 4, 0, 0]} fill={`url(#barGrad-${dataKey})`} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Hour bar chart ─────────────────────────────────────────── */
export function HourBarChartWidget({
  title,
  data,
  delay = 0,
}: {
  title: string
  data: Array<{ hour: number; count: number }>
  delay?: number
}) {
  const filled = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: String(h).padStart(2, '0'),
    count: data.find((d) => d.hour === h)?.count ?? 0,
  }))
  const max = Math.max(...filled.map((d) => d.count), 1)

  return (
    <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-white font-semibold text-sm mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={filled} barCategoryGap="15%">
          <defs>
            <linearGradient id="hourBarGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#71717a', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tickFormatter={hideZero} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} separator=": " cursor={{ fill: 'rgba(255,255,255,0.04)' }} formatter={(v) => [v, 'Calls']} labelFormatter={(l) => `${l}:00`} />
          <Bar dataKey="count" name="Calls" radius={[3, 3, 0, 0]}>
            {filled.map((d, i) => (
              <Cell key={i} fill="url(#hourBarGrad)" fillOpacity={0.2 + 0.8 * (d.count / max)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ── Pie / donut chart ──────────────────────────────────────── */
const RADIAN = Math.PI / 180

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, value, total }: {
  cx: number; cy: number; midAngle: number
  innerRadius: number; outerRadius: number
  value: number; total: number
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  // skip tiny slices and full 100% (single slice fills the circle, no room)
  if (pct < 8 || pct > 92) return null
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {pct}%
    </text>
  )
}

export function PieWidget({
  title,
  data,
  donut = false,
  delay = 0,
}: {
  title: string
  data: Array<{ name: string; value: number; color: string }>
  donut?: boolean
  delay?: number
}) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5 flex flex-col" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="text-white font-semibold text-sm mb-1">{title}</h3>
      <ResponsiveContainer width="100%" height={190}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={donut ? 50 : 0}
            outerRadius={75}
            dataKey="value"
            stroke="none"
            strokeWidth={0}
            animationBegin={0}
            animationDuration={700}
            labelLine={false}
            label={(props) => <PieLabel {...props} total={total} />}
          >
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ display: 'none' }} separator=": " />
        </PieChart>
      </ResponsiveContainer>
      {/* Custom legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-1">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-zinc-400 text-xs">{entry.name}</span>
            {total > 0 && (
              <span className="text-zinc-500 text-xs">({Math.round((entry.value / total) * 100)}%)</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
