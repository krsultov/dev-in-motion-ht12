'use client'

import {
  AreaChart,
  Area,
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
  Legend,
} from 'recharts'

const MONTHS = ['October', 'November', 'December', 'January', 'February', 'March']
const GROWTH = [0.35, 0.50, 0.63, 0.75, 0.88, 1.0]

function buildUserGrowth(total: number) {
  return MONTHS.map((month, i) => ({
    month,
    users: Math.max(1, Math.round(total * GROWTH[i])),
  }))
}

function buildRevenue(subUsers: number, pmUsers: number) {
  return MONTHS.map((month, i) => ({
    month,
    subscription: Math.round(subUsers * 4.99 * GROWTH[i]),
    perMinute: Math.round(pmUsers * 45 * 0.15 * GROWTH[i]),
  }))
}

const tooltipStyle = {
  backgroundColor: '#27272a',
  border: '1px solid #3f3f46',
  borderRadius: 10,
  color: '#fff',
}

export function AnalyticsCharts({
  totalUsers,
  subscriptionUsers,
  perMinuteUsers,
}: {
  totalUsers: number
  subscriptionUsers: number
  perMinuteUsers: number
}) {
  const userGrowth = buildUserGrowth(totalUsers)
  const revenueData = buildRevenue(subscriptionUsers, perMinuteUsers)
  const planSplit = [
    { name: 'Subscription', value: subscriptionUsers, color: '#7c73e6' },
    { name: 'Per-minute', value: perMinuteUsers, color: '#4ade80' },
  ]

  return (
    <div className="grid grid-cols-2 gap-5">
      <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-5">
        <h3 className="text-white font-semibold text-base mb-4">User growth</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={userGrowth}>
            <defs>
              <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c73e6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#7c73e6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="month" tickFormatter={(v) => v.slice(0, 3)} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis width={30} tickFormatter={(v) => v === 0 || !Number.isInteger(v) ? '' : v} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={tooltipStyle} separator=": " />
            <Area type="monotone" dataKey="users" name="Users" stroke="#7c73e6" strokeWidth={2} fill="url(#userGradient)" animationDuration={1000} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-5">
        <h3 className="text-white font-semibold text-base mb-4">Monthly revenue (€)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="month" tickFormatter={(v) => v.slice(0, 3)} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} separator=": " />
            <Bar dataKey="subscription" stackId="a" fill="#7c73e6" radius={[0, 0, 0, 0]} name="Subscriptions" />
            <Bar dataKey="perMinute" stackId="a" fill="#4ade80" radius={[4, 4, 0, 0]} name="Per-minute" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-5 col-span-2">
        <h3 className="text-white font-semibold text-base mb-4">Plan split</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={planSplit}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {planSplit.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              wrapperStyle={{ paddingTop: 24 }}
              formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: 13 }}>{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
