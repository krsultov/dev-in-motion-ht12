'use client'

import { useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { StatCard } from '@/components/StatCard'
import { CallsPerDayChart } from '@/components/CallsPerDayChart'
import { TaskBreakdownChart } from '@/components/TaskBreakdownChart'
import { TopRegions } from '@/components/TopRegions'
import { SystemAlerts } from '@/components/SystemAlerts'

const stats7 = [
  { title: 'Active users', value: '1,284', trend: '+47 this week', trendUp: true, sparkline: [38, 44, 41, 55, 62, 58, 72] },
  { title: 'Calls this week', value: '2,510', trend: '+12% vs last week', trendUp: true, sparkline: [280, 310, 295, 340, 355, 370, 386] },
  { title: 'Task success rate', value: '94.2%', trend: '-0.8% vs last week', trendUp: false, sparkline: [91, 93, 92, 95, 96, 94, 94] },
  { title: 'Avg. call duration', value: '3m 42s', trend: '+18s vs last week', trendUp: true, sparkline: [195, 188, 210, 220, 215, 228, 222] },
]

const stats14 = [
  { title: 'Active users', value: '2,841', trend: '+183 vs prior 14d', trendUp: true, sparkline: [52, 58, 61, 70, 74, 68, 80] },
  { title: 'Total calls', value: '5,620', trend: '+9.4% vs prior 14d', trendUp: true, sparkline: [340, 370, 360, 410, 430, 420, 460] },
  { title: 'Task success rate', value: '94.7%', trend: '+0.5% vs prior 14d', trendUp: true, sparkline: [92, 93, 94, 94, 95, 95, 95] },
  { title: 'Avg. call duration', value: '3m 39s', trend: '+11s vs prior 14d', trendUp: true, sparkline: [198, 202, 208, 215, 218, 222, 219] },
]

const stats30 = [
  { title: 'Active users', value: '4,840', trend: '+312 this month', trendUp: true, sparkline: [380, 420, 410, 480, 520, 510, 580] },
  { title: 'Total calls', value: '14,320', trend: '+8.4% vs last month', trendUp: true, sparkline: [1840, 1950, 2100, 2380, 2210, 2050, 2420] },
  { title: 'Task success rate', value: '93.7%', trend: '-1.3% vs last month', trendUp: false, sparkline: [91, 92, 93, 94, 94, 93, 94] },
  { title: 'Avg. call duration', value: '3m 38s', trend: '+8s vs last month', trendUp: true, sparkline: [200, 205, 210, 218, 215, 220, 218] },
]

export default function DashboardPage() {
  const [range, setRange] = useState('7')

  const stats = range === '14' ? stats14 : range === '30' ? stats30 : stats7

  const tabClass = (r: string) =>
    `px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
      range === r ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Overview dashboard</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setRange('7')} className={tabClass('7')}>7 days</button>
          <button onClick={() => setRange('14')} className={tabClass('14')}>14 days</button>
          <button onClick={() => setRange('30')} className={tabClass('30')}>30 days</button>
          <button className="ml-1 flex items-center gap-2 px-3.5 py-1.5 text-sm text-white rounded-lg border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#f87171] flex-shrink-0" />
            3 alerts
          </button>
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          {stats.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3">
            <CallsPerDayChart range={range} />
          </div>
          <div className="col-span-2">
            <TaskBreakdownChart range={range} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-6">
          <TopRegions range={range} />
          <SystemAlerts />
        </div>
      </div>
    </PageShell>
  )
}
