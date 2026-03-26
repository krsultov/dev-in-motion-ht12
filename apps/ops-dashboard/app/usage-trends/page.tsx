'use client'

import { useState } from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { PageShell } from '@/components/PageShell'

type Range = '7' | '14' | '30'

const rangeLabels: Record<Range, string> = {
  '7': '7 days',
  '14': '14 days',
  '30': '30 days',
}

const statCards: Record<Range, Array<{ title: string; value: string; trend: string; trendUp: boolean }>> = {
  '7': [
    { title: 'Total sessions', value: '2,510', trend: '+12% vs prior period', trendUp: true },
    { title: 'Unique callers', value: '1,284', trend: '+47 this week', trendUp: true },
    { title: 'Peak daily calls', value: '510', trend: 'Sun, highest day', trendUp: true },
    { title: 'Avg. daily calls', value: '358', trend: '+28 vs prior week', trendUp: true },
  ],
  '14': [
    { title: 'Total sessions', value: '5,620', trend: '+9.4% vs prior period', trendUp: true },
    { title: 'Unique callers', value: '2,841', trend: '+183 this period', trendUp: true },
    { title: 'Peak daily calls', value: '510', trend: 'Sun Mar 23, highest', trendUp: true },
    { title: 'Avg. daily calls', value: '401', trend: '+32 vs prior 14d', trendUp: true },
  ],
  '30': [
    { title: 'Total sessions', value: '14,320', trend: '+8.4% vs last month', trendUp: true },
    { title: 'Unique callers', value: '4,840', trend: '+312 this month', trendUp: true },
    { title: 'Peak daily calls', value: '621', trend: 'Mar 15, highest day', trendUp: true },
    { title: 'Avg. daily calls', value: '477', trend: '+41 vs last month', trendUp: true },
  ],
}

const areaData: Record<Range, { label: string; calls: number }[]> = {
  '7': [
    { label: 'Mon', calls: 310 },
    { label: 'Tue', calls: 370 },
    { label: 'Wed', calls: 290 },
    { label: 'Thu', calls: 420 },
    { label: 'Fri', calls: 340 },
    { label: 'Sat', calls: 270 },
    { label: 'Sun', calls: 510 },
  ],
  '14': [
    { label: 'M', calls: 298 },
    { label: 'T', calls: 344 },
    { label: 'W', calls: 310 },
    { label: 'T', calls: 390 },
    { label: 'F', calls: 325 },
    { label: 'S', calls: 252 },
    { label: 'S', calls: 481 },
    { label: 'M', calls: 310 },
    { label: 'T', calls: 370 },
    { label: 'W', calls: 290 },
    { label: 'T', calls: 420 },
    { label: 'F', calls: 340 },
    { label: 'S', calls: 270 },
    { label: 'S', calls: 510 },
  ],
  '30': [
    { label: '1 Mar', calls: 401 },
    { label: '3 Mar', calls: 438 },
    { label: '5 Mar', calls: 412 },
    { label: '7 Mar', calls: 487 },
    { label: '9 Mar', calls: 455 },
    { label: '11 Mar', calls: 502 },
    { label: '13 Mar', calls: 478 },
    { label: '15 Mar', calls: 621 },
    { label: '17 Mar', calls: 534 },
    { label: '19 Mar', calls: 490 },
    { label: '21 Mar', calls: 511 },
    { label: '23 Mar', calls: 569 },
    { label: '25 Mar', calls: 488 },
    { label: '27 Mar', calls: 531 },
    { label: '29 Mar', calls: 558 },
  ],
}

const dayOfWeekData = [
  { day: 'Mon', calls: 358 },
  { day: 'Tue', calls: 401 },
  { day: 'Wed', calls: 374 },
  { day: 'Thu', calls: 422 },
  { day: 'Fri', calls: 390 },
  { day: 'Sat', calls: 298 },
  { day: 'Sun', calls: 503 },
]

const peakHours = [
  { hour: '9:00 AM – 10:00 AM', calls: 412, pct: 86 },
  { hour: '10:00 AM – 11:00 AM', calls: 478, pct: 100 },
  { hour: '11:00 AM – 12:00 PM', calls: 451, pct: 94 },
  { hour: '12:00 PM – 1:00 PM', calls: 389, pct: 81 },
  { hour: '2:00 PM – 3:00 PM', calls: 362, pct: 76 },
  { hour: '3:00 PM – 4:00 PM', calls: 341, pct: 71 },
  { hour: '4:00 PM – 5:00 PM', calls: 298, pct: 62 },
]

function AreaTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} calls</p>
      </div>
    )
  }
  return null
}

function BarTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} avg calls</p>
      </div>
    )
  }
  return null
}

export default function UsageTrendsPage() {
  const [range, setRange] = useState<Range>('7')

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Usage trends</h1>
        <div className="flex items-center gap-2">
          {(['7', '14', '30'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                range === r
                  ? 'text-white bg-zinc-700'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {rangeLabels[r]}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          {statCards[range].map((card) => (
            <div key={card.title} className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-400 text-sm">{card.title}</p>
              <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{card.value}</p>
              <p className={`text-sm mt-1.5 ${card.trendUp ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>{card.trend}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-white font-semibold text-base">Calls over time</h3>
            <p className="text-zinc-500 text-sm mb-4">Daily volume · {rangeLabels[range]}</p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={areaData[range]}>
                <defs>
                  <linearGradient id="callsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c73e6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c73e6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip content={<AreaTooltip />} cursor={{ stroke: '#7c73e6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area
                  type="monotone"
                  dataKey="calls"
                  stroke="#7c73e6"
                  strokeWidth={2}
                  fill="url(#callsGradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#7c73e6', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-white font-semibold text-base">Calls by day of week</h3>
            <p className="text-zinc-500 text-sm mb-4">30-day average per weekday</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dayOfWeekData} barCategoryGap="30%">
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(124,115,230,0.08)' }} />
                <Bar dataKey="calls" fill="#4a4580" radius={[6, 6, 6, 6]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
          <h3 className="text-white font-semibold text-base mb-1">Peak usage hours</h3>
          <p className="text-zinc-500 text-sm mb-4">30-day average · all regions</p>
          <div className="space-y-3">
            {peakHours.map((row) => (
              <div key={row.hour} className="flex items-center gap-4">
                <span className="text-zinc-400 text-sm w-48 flex-shrink-0">{row.hour}</span>
                <div className="flex-1 bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7c73e6]"
                    style={{ width: `${row.pct}%` }}
                  />
                </div>
                <span className="text-zinc-300 text-sm w-16 text-right flex-shrink-0">{row.calls} calls</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
