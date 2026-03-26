'use client'

import { useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { PageShell } from '@/components/PageShell'

const dailySpend = [
  { day: '1 Mar', spend: 11.20, budget: 16.67 },
  { day: '3 Mar', spend: 12.84, budget: 16.67 },
  { day: '5 Mar', spend: 11.04, budget: 16.67 },
  { day: '7 Mar', spend: 13.91, budget: 16.67 },
  { day: '9 Mar', spend: 12.48, budget: 16.67 },
  { day: '11 Mar', spend: 14.22, budget: 16.67 },
  { day: '13 Mar', spend: 13.58, budget: 16.67 },
  { day: '15 Mar', spend: 18.35, budget: 16.67 },
  { day: '17 Mar', spend: 15.12, budget: 16.67 },
  { day: '19 Mar', spend: 13.88, budget: 16.67 },
  { day: '21 Mar', spend: 14.48, budget: 16.67 },
  { day: '23 Mar', spend: 16.12, budget: 16.67 },
  { day: '25 Mar', spend: 13.82, budget: 16.67 },
  { day: '27 Mar', spend: 15.04, budget: 16.67 },
  { day: '29 Mar', spend: 15.81, budget: 16.67 },
]

const cumulativeSpend = dailySpend.reduce((acc, item, i) => {
  const prev = i === 0 ? 0 : acc[i - 1].cumulative
  acc.push({ ...item, cumulative: parseFloat((prev + item.spend).toFixed(2)) })
  return acc
}, [] as { day: string; spend: number; budget: number; cumulative: number }[])

const monthlyBudget = 500
const spentSoFar = 342.10
const daysInMonth = 31
const daysPassed = 26
const dailyBurnRate = spentSoFar / daysPassed
const projectedTotal = dailyBurnRate * daysInMonth
const budgetPct = Math.round((spentSoFar / monthlyBudget) * 100)

const alerts = [
  { level: 'warning', message: 'At current burn rate, you will reach 90% of budget by Mar 28', time: 'Today' },
  { level: 'info', message: 'ElevenLabs costs up 18% this week — peak call volume on Sunday', time: 'Today' },
  { level: 'info', message: 'Mar 15 spike: €18.35 spent (110% of daily budget) — agent health incident', time: 'Mar 15' },
]

function SpendTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">Cumulative: €{payload[0].value}</p>
      </div>
    )
  }
  return null
}

export default function BillingPage() {
  const [showProjected, setShowProjected] = useState(true)

  const barColor = budgetPct >= 90 ? '#f87171' : budgetPct >= 70 ? '#fbbf24' : '#4ade80'

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Billing</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Monthly budget</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€{monthlyBudget}</p>
            <p className="text-zinc-400 text-sm mt-1.5">Resets Apr 1</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Spent this month</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€{spentSoFar.toFixed(0)}</p>
            <p style={{ color: barColor }} className="text-sm mt-1.5">{budgetPct}% of budget used</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Daily burn rate</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€{dailyBurnRate.toFixed(2)}</p>
            <p className="text-[#fbbf24] text-sm mt-1.5">+8% vs last month</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Projected end of month</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€{projectedTotal.toFixed(0)}</p>
            <p className="text-[#4ade80] text-sm mt-1.5">€{(monthlyBudget - projectedTotal).toFixed(0)} under budget</p>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-white font-semibold text-base">Budget consumption</h3>
              <p className="text-zinc-500 text-sm">March 2026 · €{spentSoFar.toFixed(2)} of €{monthlyBudget}</p>
            </div>
            <span style={{ color: barColor }} className="text-sm font-semibold">{budgetPct}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mt-3">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${budgetPct}%`, backgroundColor: barColor }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-zinc-600 text-xs">€0</span>
            <span className="text-zinc-600 text-xs">€{monthlyBudget / 2} (50%)</span>
            <span className="text-zinc-600 text-xs">€{monthlyBudget}</span>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-white font-semibold text-base">Cumulative spend</h3>
              <p className="text-zinc-500 text-sm">March 2026 · daily total API costs</p>
            </div>
            <button
              onClick={() => setShowProjected(!showProjected)}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                showProjected ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Show budget line
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cumulativeSpend}>
              <defs>
                <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c73e6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c73e6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} dy={8} />
              <YAxis hide />
              <Tooltip content={<SpendTooltip />} cursor={{ stroke: '#7c73e6', strokeWidth: 1, strokeDasharray: '4 4' }} />
              {showProjected && <ReferenceLine y={monthlyBudget} stroke="#f87171" strokeDasharray="6 3" strokeWidth={1.5} label={{ value: 'Budget', fill: '#f87171', fontSize: 11 }} />}
              <Area type="monotone" dataKey="cumulative" stroke="#7c73e6" strokeWidth={2} fill="url(#spendGradient)" dot={false} activeDot={{ r: 4, fill: '#7c73e6', strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-base">Budget alerts</h3>
            <p className="text-zinc-500 text-sm mt-0.5">Triggered when spend approaches thresholds</p>
          </div>
          <ul className="divide-y divide-zinc-800">
            {alerts.map((alert, i) => (
              <li key={i} className="px-5 py-4 flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {alert.level === 'warning' ? (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <path d="M10 3L18 17H2L10 3Z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" />
                      <path d="M10 9v4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="10" cy="14.5" r="0.75" fill="#fbbf24" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="#7c73e6" strokeWidth="1.5" />
                      <path d="M10 6v5" stroke="#7c73e6" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="10" cy="14" r="0.75" fill="#7c73e6" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-white text-sm">{alert.message}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{alert.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageShell>
  )
}
