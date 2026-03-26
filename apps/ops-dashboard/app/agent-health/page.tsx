'use client'

import { useState } from 'react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { PageShell } from '@/components/PageShell'

const failureRate7 = [
  { day: 'Mon', failed: 3, total: 310 },
  { day: 'Tue', failed: 5, total: 370 },
  { day: 'Wed', failed: 2, total: 290 },
  { day: 'Thu', failed: 7, total: 420 },
  { day: 'Fri', failed: 4, total: 340 },
  { day: 'Sat', failed: 2, total: 270 },
  { day: 'Sun', failed: 4, total: 510 },
]

const failureRate14 = [
  { day: 'M', failed: 3, total: 298 },
  { day: 'T', failed: 4, total: 344 },
  { day: 'W', failed: 2, total: 310 },
  { day: 'T', failed: 6, total: 390 },
  { day: 'F', failed: 3, total: 325 },
  { day: 'S', failed: 2, total: 252 },
  { day: 'S', failed: 5, total: 481 },
  { day: 'M', failed: 3, total: 310 },
  { day: 'T', failed: 5, total: 370 },
  { day: 'W', failed: 2, total: 290 },
  { day: 'T', failed: 7, total: 420 },
  { day: 'F', failed: 4, total: 340 },
  { day: 'S', failed: 2, total: 270 },
  { day: 'S', failed: 4, total: 510 },
]

const failureRate30 = [
  { day: '1 Mar', failed: 22, total: 1840 },
  { day: '5 Mar', failed: 31, total: 2100 },
  { day: '10 Mar', failed: 19, total: 1950 },
  { day: '15 Mar', failed: 38, total: 2380 },
  { day: '20 Mar', failed: 28, total: 2210 },
  { day: '25 Mar', failed: 24, total: 2050 },
  { day: '30 Mar', failed: 27, total: 2420 },
]

const errorTypes = [
  { type: 'STT timeout', count: 12 },
  { type: 'LLM timeout', count: 7 },
  { type: 'TTS failure', count: 4 },
  { type: 'No response', count: 3 },
  { type: 'Call dropped', count: 11 },
  { type: 'Low confidence', count: 18 },
]

const recentIncidents = [
  { id: 'INC-0184', type: 'timeout', region: 'Stara Zagora', description: 'LLM timeout after 8s — 3 consecutive calls', time: 'Today, 11:42 AM', resolved: false },
  { id: 'INC-0183', type: 'latency', region: 'Varna', description: 'Avg response +2.4s above baseline for 18 minutes', time: 'Today, 10:15 AM', resolved: false },
  { id: 'INC-0182', type: 'confidence', region: 'Sofia', description: '6 calls with <60% intent confidence in 1 hour', time: 'Today, 9:31 AM', resolved: true },
  { id: 'INC-0181', type: 'stt', region: 'Plovdiv', description: 'Whisper STT failure — audio quality too low', time: 'Yesterday, 7:48 PM', resolved: true },
  { id: 'INC-0180', type: 'dropped', region: 'Burgas', description: '4 calls dropped mid-session — carrier issue suspected', time: 'Yesterday, 4:12 PM', resolved: true },
  { id: 'INC-0179', type: 'timeout', region: 'Stara Zagora', description: 'ElevenLabs TTS timeout — fallback text response used', time: 'Yesterday, 1:05 PM', resolved: true },
]

const incidentTypeStyles: { [key: string]: string } = {
  timeout: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
  latency: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  confidence: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  stt: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
  dropped: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  tts: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
}

function LineTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const rate = ((payload[0].payload.failed / payload[0].payload.total) * 100).toFixed(1)
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].payload.failed} failed ({rate}%)</p>
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
        <p className="text-white font-semibold">{payload[0].value} incidents</p>
      </div>
    )
  }
  return null
}

export default function AgentHealthPage() {
  const [range, setRange] = useState('7')

  let data = failureRate7
  if (range === '14') data = failureRate14
  if (range === '30') data = failureRate30

  const totalFailed = data.reduce((sum, d) => sum + d.failed, 0)
  const totalCalls = data.reduce((sum, d) => sum + d.total, 0)
  const failRate = ((totalFailed / totalCalls) * 100).toFixed(1)

  const tabClass = (r: string) =>
    `px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
      range === r ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Agent health</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setRange('7')} className={tabClass('7')}>7 days</button>
          <button onClick={() => setRange('14')} className={tabClass('14')}>14 days</button>
          <button onClick={() => setRange('30')} className={tabClass('30')}>30 days</button>
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Failed calls</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{totalFailed}</p>
            <p className="text-[#f87171] text-sm mt-1.5">{failRate}% failure rate</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Avg response time</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">1.84s</p>
            <p className="text-[#4ade80] text-sm mt-1.5">Within baseline</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Timeout rate</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">0.8%</p>
            <p className="text-[#fbbf24] text-sm mt-1.5">+0.2% vs last week</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Low confidence turns</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">18</p>
            <p className="text-zinc-400 text-sm mt-1.5">Out of 3,512 total</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4">
          <div className="col-span-3 bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-white font-semibold text-base">Failed calls over time</h3>
            <p className="text-zinc-500 text-sm mb-4">Daily count · {range === '30' ? 'last 30 days' : `last ${range} days`}</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} dy={8} />
                <YAxis hide />
                <Tooltip content={<LineTooltip />} cursor={{ stroke: '#f87171', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line type="monotone" dataKey="failed" stroke="#f87171" strokeWidth={2} dot={false} activeDot={{ r: 4, fill: '#f87171', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-2 bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-white font-semibold text-base">Failures by type</h3>
            <p className="text-zinc-500 text-sm mb-4">Last 30 days</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={errorTypes} layout="vertical" barCategoryGap="25%">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11 }} width={90} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(124,115,230,0.08)' }} />
                <Bar dataKey="count" fill="#f87171" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-base">Recent incidents</h3>
            <p className="text-zinc-500 text-sm mt-0.5">Failures and anomalies requiring attention</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Region</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentIncidents.map((inc) => (
                <tr key={inc.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-zinc-400 text-xs">{inc.id}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${incidentTypeStyles[inc.type]}`}>
                      {inc.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{inc.region}</td>
                  <td className="px-5 py-3 text-zinc-400 text-xs max-w-xs">{inc.description}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{inc.time}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      inc.resolved
                        ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10'
                        : 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10'
                    }`}>
                      {inc.resolved ? 'resolved' : 'open'}
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
