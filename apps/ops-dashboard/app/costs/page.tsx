'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { PageShell } from '@/components/PageShell'

const daily7 = [
  { day: 'Mon', whisper: 0.71, gpt: 9.12, elevenlabs: 2.18 },
  { day: 'Tue', whisper: 0.84, gpt: 10.88, elevenlabs: 2.52 },
  { day: 'Wed', whisper: 0.66, gpt: 8.54, elevenlabs: 2.04 },
  { day: 'Thu', whisper: 0.94, gpt: 12.14, elevenlabs: 2.90 },
  { day: 'Fri', whisper: 0.78, gpt: 10.04, elevenlabs: 2.40 },
  { day: 'Sat', whisper: 0.62, gpt: 7.98, elevenlabs: 1.91 },
  { day: 'Sun', whisper: 1.08, gpt: 13.94, elevenlabs: 3.33 },
]

const daily14 = [
  { day: 'M', whisper: 0.68, gpt: 8.74, elevenlabs: 2.09 },
  { day: 'T', whisper: 0.76, gpt: 9.78, elevenlabs: 2.34 },
  { day: 'W', whisper: 0.71, gpt: 9.14, elevenlabs: 2.18 },
  { day: 'T', whisper: 0.88, gpt: 11.32, elevenlabs: 2.71 },
  { day: 'F', whisper: 0.75, gpt: 9.62, elevenlabs: 2.30 },
  { day: 'S', whisper: 0.58, gpt: 7.44, elevenlabs: 1.78 },
  { day: 'S', whisper: 1.02, gpt: 13.10, elevenlabs: 3.13 },
  { day: 'M', whisper: 0.71, gpt: 9.12, elevenlabs: 2.18 },
  { day: 'T', whisper: 0.84, gpt: 10.88, elevenlabs: 2.52 },
  { day: 'W', whisper: 0.66, gpt: 8.54, elevenlabs: 2.04 },
  { day: 'T', whisper: 0.94, gpt: 12.14, elevenlabs: 2.90 },
  { day: 'F', whisper: 0.78, gpt: 10.04, elevenlabs: 2.40 },
  { day: 'S', whisper: 0.62, gpt: 7.98, elevenlabs: 1.91 },
  { day: 'S', whisper: 1.08, gpt: 13.94, elevenlabs: 3.33 },
]

const daily30 = [
  { day: '1 Mar', whisper: 9.84, gpt: 126.4, elevenlabs: 30.2 },
  { day: '5 Mar', whisper: 11.20, gpt: 144.0, elevenlabs: 34.4 },
  { day: '10 Mar', whisper: 10.41, gpt: 133.8, elevenlabs: 32.0 },
  { day: '15 Mar', whisper: 12.68, gpt: 163.0, elevenlabs: 39.0 },
  { day: '20 Mar', whisper: 11.74, gpt: 150.8, elevenlabs: 36.1 },
  { day: '25 Mar', whisper: 10.92, gpt: 140.4, elevenlabs: 33.6 },
  { day: '30 Mar', whisper: 12.91, gpt: 165.9, elevenlabs: 39.7 },
]

const topUsers = [
  { name: 'Vasil Georgiev', phone: '+359 88 556 7788', calls: 91, cost: '€8.42' },
  { name: 'Hristo Nikolov', phone: '+359 87 119 8821', calls: 81, cost: '€7.51' },
  { name: 'Georgi Marinov', phone: '+359 88 102 8874', calls: 72, cost: '€6.71' },
  { name: 'Stefan Petkov', phone: '+359 88 234 7712', calls: 63, cost: '€5.84' },
  { name: 'Plamen Ivanov', phone: '+359 89 556 0033', calls: 52, cost: '€4.82' },
  { name: 'Dimitar Petrov', phone: '+359 88 412 3847', calls: 48, cost: '€4.44' },
  { name: 'Todor Hristov', phone: '+359 88 667 2233', calls: 44, cost: '€4.08' },
  { name: 'Denitsa Tsanova', phone: '+359 87 228 4477', calls: 38, cost: '€3.52' },
  { name: 'Irina Stoyanova', phone: '+359 87 321 8844', calls: 37, cost: '€3.43' },
  { name: 'Marta Ivanova', phone: '+359 89 762 1204', calls: 31, cost: '€2.87' },
]

function CostTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const total = payload.reduce((sum: number, p: any) => sum + p.value, 0)
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm space-y-1">
        <p className="text-zinc-400">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.fill }} className="font-medium">
            {p.name}: €{p.value.toFixed(2)}
          </p>
        ))}
        <p className="text-white font-semibold border-t border-zinc-700 pt-1 mt-1">Total: €{total.toFixed(2)}</p>
      </div>
    )
  }
  return null
}

export default function CostsPage() {
  const [range, setRange] = useState('7')

  let data = daily7
  let subtitle = 'Last 7 days'
  if (range === '14') { data = daily14; subtitle = 'Last 14 days' }
  if (range === '30') { data = daily30; subtitle = 'Last 30 days · weekly totals' }

  const tabClass = (r: string) =>
    `px-3.5 py-1.5 text-sm rounded-lg font-medium transition-colors ${
      range === r ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">API costs</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setRange('7')} className={tabClass('7')}>7 days</button>
          <button onClick={() => setRange('14')} className={tabClass('14')}>14 days</button>
          <button onClick={() => setRange('30')} className={tabClass('30')}>30 days</button>
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total cost today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€18.35</p>
            <p className="text-[#f87171] text-sm mt-1.5">+12% vs yesterday</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Whisper (STT)</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€1.08</p>
            <p className="text-zinc-400 text-sm mt-1.5">€0.0021 per call</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">GPT-4o</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€13.94</p>
            <p className="text-zinc-400 text-sm mt-1.5">€0.0273 per call</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">ElevenLabs (TTS)</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">€3.33</p>
            <p className="text-zinc-400 text-sm mt-1.5">€0.0065 per call</p>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
          <h3 className="text-white font-semibold text-base mb-1">Cost by provider</h3>
          <p className="text-zinc-500 text-sm mb-5">{subtitle}</p>
          <div className="flex items-center gap-5 mb-4">
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="w-3 h-3 rounded-sm bg-[#7c73e6]" />
              Whisper
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="w-3 h-3 rounded-sm bg-[#4ade80]" />
              GPT-4o
            </span>
            <span className="flex items-center gap-2 text-sm text-zinc-300">
              <span className="w-3 h-3 rounded-sm bg-[#fbbf24]" />
              ElevenLabs
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} barCategoryGap="30%">
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 13 }} dy={8} />
              <YAxis hide />
              <Tooltip content={<CostTooltip />} cursor={{ fill: 'rgba(124,115,230,0.08)' }} />
              <Bar dataKey="whisper" name="Whisper" stackId="a" fill="#7c73e6" radius={[0, 0, 0, 0]} />
              <Bar dataKey="gpt" name="GPT-4o" stackId="a" fill="#4ade80" radius={[0, 0, 0, 0]} />
              <Bar dataKey="elevenlabs" name="ElevenLabs" stackId="a" fill="#fbbf24" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-800">
            <h3 className="text-white font-semibold text-base">Top 10 by cost</h3>
            <p className="text-zinc-500 text-sm mt-0.5">Highest spending users this month</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Calls</th>
                <th className="px-5 py-3 font-medium">Total cost</th>
                <th className="px-5 py-3 font-medium">Avg per call</th>
              </tr>
            </thead>
            <tbody>
              {topUsers.map((user) => {
                const avg = (parseFloat(user.cost.replace('€', '')) / user.calls).toFixed(4)
                return (
                  <tr key={user.phone} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="text-white font-medium">{user.name}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{user.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-300">{user.calls}</td>
                    <td className="px-5 py-3 text-white font-medium">{user.cost}</td>
                    <td className="px-5 py-3 text-zinc-400">€{avg}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
