'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const tooltipStyle = {
  backgroundColor: '#27272a',
  border: '1px solid #3f3f46',
  borderRadius: 10,
  color: '#fff',
}

const tooltipItemStyle = { color: '#a1a1aa', fontSize: 13 }
const tooltipLabelStyle = { color: '#fff', fontWeight: 600, marginBottom: 4 }

function formatMonthShort(value: string) {
  const [, month] = value.split('-')
  return new Date(2000, Number(month) - 1).toLocaleString('en-GB', { month: 'short' })
}

function formatMonthLong(value: string) {
  const [year, month] = value.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })
}

const hideZero = (v: number): string => v === 0 ? '' : String(v)

type UserGrowthEntry = { month: string; newUsers: number; totalUsers: number }
type RevenueEntry = { month: string; subscription: number; perMinute: number }
type MinutesEntry = { month: string; minutes: number }

export function AnalyticsCharts({
  subscriptionUsers,
  perMinuteUsers,
  userGrowth,
  revenueData,
  minutesByMonth,
}: {
  subscriptionUsers: number
  perMinuteUsers: number
  userGrowth: UserGrowthEntry[]
  revenueData: RevenueEntry[]
  minutesByMonth: MinutesEntry[]
}) {
  const hasGrowthData = userGrowth.length > 0
  const hasMinutesData = minutesByMonth.length > 0
  const hasRevenueData = revenueData.length > 0

  const empty = (label: string) => (
    <div className="h-[220px] flex items-center justify-center text-zinc-500 text-sm">{label}</div>
  )

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* User growth */}
      <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5" style={{ animationDelay: '0ms' }}>
        <h3 className="text-white font-semibold text-sm mb-4">User growth</h3>
        {hasGrowthData ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={userGrowth}>
              <defs>
                <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c73e6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c73e6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis width={28} tickFormatter={(v) => !Number.isInteger(v) ? '' : hideZero(Number(v))} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} labelFormatter={formatMonthLong} separator=": " />
              <Area type="monotone" dataKey="totalUsers" name="Total users" stroke="#7c73e6" strokeWidth={2} fill="url(#userGradient)" animationDuration={1000} />
              <Area type="monotone" dataKey="newUsers" name="Joined" stroke="transparent" strokeWidth={0} fill="none" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        ) : empty('No growth data yet')}
      </div>

      {/* Call minutes */}
      <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5" style={{ animationDelay: '80ms' }}>
        <h3 className="text-white font-semibold text-sm mb-4">Call minutes</h3>
        {hasMinutesData ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={minutesByMonth}>
              <defs>
                <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={hideZero} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} labelFormatter={formatMonthLong} separator=": " formatter={(value: number) => [`${value} min`, 'Minutes']} />
              <Area type="monotone" dataKey="minutes" name="Minutes" stroke="#38bdf8" strokeWidth={2} fill="url(#minutesGradient)" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        ) : empty('No call data yet')}
      </div>

      {/* Monthly revenue */}
      <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 p-5" style={{ animationDelay: '160ms' }}>
        <h3 className="text-white font-semibold text-sm mb-4">Monthly revenue (€)</h3>
        {hasRevenueData ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c73e6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c73e6" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="pmGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="month" tickFormatter={formatMonthShort} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={hideZero} tick={{ fill: '#71717a', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} labelFormatter={formatMonthLong} separator=": " />
              <Area type="monotone" dataKey="subscription" stackId="a" stroke="#7c73e6" strokeWidth={2} fill="url(#subGradient)" name="Subscriptions" animationDuration={1000} />
              <Area type="monotone" dataKey="perMinute" stackId="a" stroke="#4ade80" strokeWidth={2} fill="url(#pmGradient)" name="Per-minute" animationDuration={1000} />
            </AreaChart>
          </ResponsiveContainer>
        ) : empty('No revenue data yet')}
      </div>
    </div>
  )
}
