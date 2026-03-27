'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { SUBSCRIPTION_PRICE, PER_MINUTE_RATE } from '@/lib/pricing'
import {
  AreaChart,
  Area,
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
    subscription: Math.round(subUsers * SUBSCRIPTION_PRICE * GROWTH[i]),
    perMinute: Math.round(pmUsers * 45 * PER_MINUTE_RATE * GROWTH[i]),
  }))
}

const tooltipStyle = {
  backgroundColor: '#27272a',
  border: '1px solid #3f3f46',
  borderRadius: 10,
  color: '#fff',
}

const tooltipItemStyle = { color: '#a1a1aa', fontSize: 13 }
const tooltipLabelStyle = { color: '#fff', fontWeight: 600, marginBottom: 4 }

const CHART_TITLES = ['User growth', 'Monthly revenue (€)', 'Plan split']

export function AnalyticsCharts({
  totalUsers,
  subscriptionUsers,
  perMinuteUsers,
}: {
  totalUsers: number
  subscriptionUsers: number
  perMinuteUsers: number
}) {
  const [current, setCurrent] = useState(0)

  const navigate = (dir: 'next' | 'prev') => {
    setCurrent((c) => dir === 'next' ? (c + 1) % 3 : (c - 1 + 3) % 3)
  }

  const userGrowth = buildUserGrowth(totalUsers)
  const revenueData = buildRevenue(subscriptionUsers, perMinuteUsers)
  const planSplit = [
    { name: 'Subscriptions', value: subscriptionUsers, color: '#7c73e6' },
    { name: 'Per-minute', value: perMinuteUsers, color: '#4ade80' },
  ]

  return (
    <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-white font-semibold text-base">{CHART_TITLES[current]}</h3>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 mr-2">
            {CHART_TITLES.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (i !== current) navigate(i > current ? 'next' : 'prev') }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === current ? 'bg-[#7c73e6]' : 'bg-zinc-600 hover:bg-zinc-500'}`}
              />
            ))}
          </div>
          <button onClick={() => navigate('prev')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => navigate('next')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div key={current}>
        <ResponsiveContainer width="100%" height={300}>
          {current === 0 ? (
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
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} separator=": " />
              <Area type="monotone" dataKey="users" name="Users" stroke="#7c73e6" strokeWidth={2} fill="url(#userGradient)" animationDuration={1000} />
            </AreaChart>
          ) : current === 1 ? (
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
              <XAxis dataKey="month" tickFormatter={(v) => v.slice(0, 3)} tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717a', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={tooltipLabelStyle} separator=": " />
              <Area type="monotone" dataKey="subscription" stackId="a" stroke="#7c73e6" strokeWidth={2} fill="url(#subGradient)" name="Subscriptions" animationDuration={1000} />
              <Area type="monotone" dataKey="perMinute" stackId="a" stroke="#4ade80" strokeWidth={2} fill="url(#pmGradient)" name="Per-minute" animationDuration={1000} />
            </AreaChart>
          ) : (
            <PieChart>
              <Pie data={planSplit} cx="50%" cy="45%" outerRadius={80} dataKey="value" stroke="none" animationBegin={0} animationDuration={600}>
                {planSplit.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ display: 'none' }} separator=": " />
              <Legend wrapperStyle={{ paddingTop: 12 }} formatter={(value) => <span style={{ color: '#a1a1aa', fontSize: 12 }}>{value}</span>} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
