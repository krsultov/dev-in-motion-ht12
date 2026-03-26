'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
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
    { title: 'Revenue this week', value: '€4,218', trend: '+11.4% vs last week', trendUp: true },
    { title: 'Active subscriptions', value: '284', trend: '+6 this week', trendUp: true },
    { title: 'Revenue per call', value: '€1.68', trend: '+€0.04 vs last week', trendUp: true },
    { title: 'Pending invoices', value: '€812', trend: '3 overdue', trendUp: false },
  ],
  '14': [
    { title: 'Revenue (14 days)', value: '€8,904', trend: '+9.2% vs prior 14d', trendUp: true },
    { title: 'Active subscriptions', value: '284', trend: '+6 this period', trendUp: true },
    { title: 'Revenue per call', value: '€1.58', trend: '+€0.06 vs prior 14d', trendUp: true },
    { title: 'Pending invoices', value: '€812', trend: '3 overdue', trendUp: false },
  ],
  '30': [
    { title: 'Monthly revenue', value: '€18,340', trend: '+14.2% vs last month', trendUp: true },
    { title: 'Active subscriptions', value: '284', trend: '+18 this month', trendUp: true },
    { title: 'Revenue per call', value: '€1.28', trend: '+€0.09 vs last month', trendUp: true },
    { title: 'Pending invoices', value: '€812', trend: '3 overdue', trendUp: false },
  ],
}

const revenueTrend: Record<Range, { label: string; revenue: number }[]> = {
  '7': [
    { label: 'Mon', revenue: 521 },
    { label: 'Tue', revenue: 608 },
    { label: 'Wed', revenue: 488 },
    { label: 'Thu', revenue: 702 },
    { label: 'Fri', revenue: 634 },
    { label: 'Sat', revenue: 412 },
    { label: 'Sun', revenue: 853 },
  ],
  '14': [
    { label: 'M', revenue: 498 },
    { label: 'T', revenue: 572 },
    { label: 'W', revenue: 514 },
    { label: 'T', revenue: 641 },
    { label: 'F', revenue: 588 },
    { label: 'S', revenue: 390 },
    { label: 'S', revenue: 801 },
    { label: 'M', revenue: 521 },
    { label: 'T', revenue: 608 },
    { label: 'W', revenue: 488 },
    { label: 'T', revenue: 702 },
    { label: 'F', revenue: 634 },
    { label: 'S', revenue: 412 },
    { label: 'S', revenue: 853 },
  ],
  '30': [
    { label: 'Jan', revenue: 12840 },
    { label: 'Feb', revenue: 14210 },
    { label: 'Mar', revenue: 16050 },
    { label: 'Apr', revenue: 15320 },
    { label: 'May', revenue: 17480 },
    { label: 'Jun', revenue: 18340 },
  ],
}

const revenueByRegion = [
  { region: 'Sofia', revenue: 9840 },
  { region: 'Plovdiv', revenue: 4210 },
  { region: 'Varna', revenue: 2880 },
  { region: 'Burgas', revenue: 1060 },
  { region: 'Stara Zagora', revenue: 350 },
]

const invoices = [
  { id: 'INV-2284', account: 'A1 Bulgaria', period: 'Mar 1–31, 2026', calls: 14320, amount: '€18,340', status: 'paid' },
  { id: 'INV-2283', account: 'A1 Bulgaria', period: 'Feb 1–28, 2026', calls: 13210, amount: '€16,050', status: 'paid' },
  { id: 'INV-2282', account: 'A1 Bulgaria', period: 'Jan 1–31, 2026', calls: 11840, amount: '€14,210', status: 'paid' },
  { id: 'INV-2281', account: 'A1 Bulgaria', period: 'Dec 1–31, 2025', calls: 10290, amount: '€12,840', status: 'paid' },
  { id: 'INV-2280', account: 'A1 Bulgaria', period: 'Nov 1–30, 2025', calls: 9810, amount: '€11,740', status: 'overdue' },
]

const invoiceStatusStyles: Record<string, string> = {
  paid: 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  overdue: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
  pending: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
}

function RevenueTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">€{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

function RegionTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">€{payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function RevenuePage() {
  const [range, setRange] = useState<Range>('30')

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Revenue</h1>
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
            <h3 className="text-white font-semibold text-base">Revenue trend</h3>
            <p className="text-zinc-500 text-sm mb-4">
              {range === '30' ? 'Monthly totals · last 6 months' : `Daily revenue · last ${range} days`}
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueTrend[range]}>
                <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  dy={8}
                />
                <YAxis hide />
                <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#4ade80', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#4ade80', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-white font-semibold text-base">Revenue by region</h3>
            <p className="text-zinc-500 text-sm mb-4">Monthly totals · all time</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByRegion} layout="vertical" barCategoryGap="30%">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="region"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#71717a', fontSize: 12 }}
                  width={80}
                />
                <Tooltip content={<RegionTooltip />} cursor={{ fill: 'rgba(124,115,230,0.08)' }} />
                <Bar dataKey="revenue" fill="#7c73e6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-base">Invoices</h3>
            <p className="text-zinc-500 text-sm mt-0.5">Billing history · A1 Bulgaria account</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">Invoice</th>
                <th className="px-5 py-3 font-medium">Account</th>
                <th className="px-5 py-3 font-medium">Period</th>
                <th className="px-5 py-3 font-medium">Calls</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-zinc-400 text-xs">{inv.id}</td>
                  <td className="px-5 py-3 text-white font-medium">{inv.account}</td>
                  <td className="px-5 py-3 text-zinc-300">{inv.period}</td>
                  <td className="px-5 py-3 text-zinc-300">{inv.calls.toLocaleString()}</td>
                  <td className="px-5 py-3 text-white font-medium">{inv.amount}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${invoiceStatusStyles[inv.status]}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
