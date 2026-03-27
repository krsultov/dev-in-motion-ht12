import { PageShell } from '@/components/PageShell'
import {
  AreaChartWidget,
  BarChartWidget,
  HourBarChartWidget,
  PieWidget,
} from '@/components/AnalyticsCallCharts'
import { TopUsersLeaderboard } from '@/components/TopUsersLeaderboard'
import { Phone, Clock, TrendingUp, ArrowDownLeft, ArrowUpRight, Timer, CheckCircle, Flame } from 'lucide-react'

type CallStats = {
  totalCalls: number
  completedCalls: number
  avgDurationSec: number
  medianDurationSec: number
  minDurationSec: number
  maxDurationSec: number
  totalMinutes: number
  byType: Record<string, number>
  durationDistribution: Array<{ range: string; count: number }>
  byHour: Array<{ hour: number; count: number }>
}

type OverviewStats = {
  callsByMonth: Array<{ month: string; count: number }>
  minutesByMonth: Array<{ month: string; minutes: number }>
  planDistribution: { subscription: number; perMinute: number }
}

type CallMinutesByUser = Record<string, number>

function fmt(sec: number): string {
  if (sec < 60) return `${sec}s`
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return s > 0 ? `${m}m ${s}s` : `${m}m`
}


async function getCallStats(): Promise<CallStats | null> {
  try {
    const res = await fetch(`${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/stats/calls`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getOverviewStats(): Promise<OverviewStats | null> {
  try {
    const res = await fetch(`${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/stats/overview`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getCallMinutesByUser(): Promise<CallMinutesByUser> {
  try {
    const res = await fetch(`${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/stats/call-minutes-by-user`, { cache: 'no-store' })
    if (!res.ok) return {}
    return res.json()
  } catch { return {} }
}

async function getUsers(): Promise<Array<{ phone: string; name?: string }>> {
  try {
    const res = await fetch(`${process.env.USER_DATA_API_URL ?? 'http://localhost:3002'}/userData`, { cache: 'no-store' })
    if (!res.ok) return []
    return res.json()
  } catch { return [] }
}

export default async function AnalyticsPage() {
  const [stats, overview, callMinutesByUser, users] = await Promise.all([
    getCallStats(),
    getOverviewStats(),
    getCallMinutesByUser(),
    getUsers(),
  ])

  const phoneToName = Object.fromEntries(users.map((u) => [u.phone, u.name]))

  const topUsers = Object.entries(callMinutesByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([phone, minutes]) => ({ phone, name: phoneToName[phone], minutes }))

  const maxMinutes = topUsers[0]?.minutes ?? 1

  // Chart data
  const callsByMonth = (overview?.callsByMonth ?? []).map((e) => ({ month: e.month, count: e.count }))
  const minutesByMonth = (overview?.minutesByMonth ?? []).map((e) => ({ month: e.month, minutes: e.minutes }))

  const planPie = [
    { name: 'Subscription', value: overview?.planDistribution.subscription ?? 0, color: '#7c73e6' },
    { name: 'Per-minute', value: overview?.planDistribution.perMinute ?? 0, color: '#4a5568' },
  ]

  const typePie = stats
    ? [
        { name: 'Inbound', value: stats.byType?.inbound ?? 0, color: '#7c73e6' },
        { name: 'Outbound', value: stats.byType?.outbound ?? 0, color: '#52525b' },
      ]
    : []

  const completionPie = stats
    ? [
        { name: 'Completed', value: stats.completedCalls, color: '#7c73e6' },
        { name: 'Incomplete', value: Math.max(0, stats.totalCalls - stats.completedCalls), color: '#3f3f46' },
      ]
    : []

  type StatCard = {
    label: string
    value: string | number
    Icon: React.ElementType
    accent: string
    iconBg: string
    delay: number
  }

  const statCards: StatCard[] = stats
    ? [
        { label: 'Total calls', value: stats.totalCalls, Icon: Phone, accent: 'border-l-[#7c73e6]', iconBg: 'bg-[#2e2b5c] text-[#7c73e6]', delay: 0 },
        { label: 'Completed', value: stats.completedCalls, Icon: CheckCircle, accent: 'border-l-[#4ade80]', iconBg: 'bg-[#1a3a2a] text-[#4ade80]', delay: 60 },
        { label: 'Avg duration', value: fmt(stats.avgDurationSec), Icon: Clock, accent: 'border-l-[#38bdf8]', iconBg: 'bg-[#0e2a3a] text-[#38bdf8]', delay: 120 },
        { label: 'Median duration', value: fmt(stats.medianDurationSec), Icon: Timer, accent: 'border-l-[#38bdf8]', iconBg: 'bg-[#0e2a3a] text-[#38bdf8]', delay: 180 },
        { label: 'Longest call', value: fmt(stats.maxDurationSec), Icon: Flame, accent: 'border-l-[#fbbf24]', iconBg: 'bg-[#3a2a1a] text-[#fbbf24]', delay: 240 },
        { label: 'Total minutes', value: stats.totalMinutes, Icon: TrendingUp, accent: 'border-l-[#7c73e6]', iconBg: 'bg-[#2e2b5c] text-[#7c73e6]', delay: 300 },
        { label: 'Inbound', value: stats.byType?.inbound ?? 0, Icon: ArrowDownLeft, accent: 'border-l-[#38bdf8]', iconBg: 'bg-[#0e2a3a] text-[#38bdf8]', delay: 360 },
        { label: 'Outbound', value: stats.byType?.outbound ?? 0, Icon: ArrowUpRight, accent: 'border-l-[#f87171]', iconBg: 'bg-[#3a1a1a] text-[#f87171]', delay: 420 },
      ]
    : []

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Analytics</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`animate-fade-up bg-[#27272a] rounded-2xl px-5 py-5 border border-zinc-800 border-l-2 ${s.accent} flex items-start gap-4`}
              style={{ animationDelay: `${s.delay}ms` }}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${s.iconBg}`}>
                <s.Icon size={16} />
              </div>
              <div>
                <p className="text-zinc-400 text-xs">{s.label}</p>
                <p className="text-2xl font-bold mt-1 leading-none tracking-tight text-white">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {!stats && (
          <div className="bg-[#27272a] rounded-2xl border border-zinc-800 px-5 py-10 text-center text-zinc-500 text-sm">
            No call data available
          </div>
        )}

        {/* Monthly trends */}
        <div className="grid grid-cols-2 gap-4">
          <AreaChartWidget
            title="Calls per month"
            data={callsByMonth}
            series={[{ key: 'count', name: 'Calls', color: '#7c73e6' }]}
            delay={0}
          />
          <AreaChartWidget
            title="Call minutes per month"
            data={minutesByMonth}
            series={[{ key: 'minutes', name: 'Minutes', color: '#38bdf8' }]}
            delay={80}
          />
        </div>

        {/* Pie charts */}
        <div className="grid grid-cols-3 gap-4">
          <PieWidget
            title="Plan distribution"
            data={planPie}
            delay={0}
          />
          <PieWidget
            title="Inbound vs outbound"
            data={typePie}
            delay={80}
          />
          <PieWidget
            title="Call completion rate"
            data={completionPie}
            donut
            delay={160}
          />
        </div>

        {/* Call pattern charts */}
        {stats && (
          <div className="grid grid-cols-2 gap-4">
            <BarChartWidget
              title="Call duration distribution"
              data={stats.durationDistribution}
              dataKey="count"
              labelKey="range"
              color="#7c73e6"
              delay={0}
            />
            <HourBarChartWidget
              title="Calls by hour of day"
              data={stats.byHour}
              delay={80}
            />
          </div>
        )}

        {/* Top users */}
        <TopUsersLeaderboard users={topUsers} maxMinutes={maxMinutes} />

      </div>
    </PageShell>
  )
}
