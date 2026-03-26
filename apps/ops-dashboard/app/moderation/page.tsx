'use client'

import { useState } from 'react'
import { PageShell } from '@/components/PageShell'

const events = [
  { id: 'MOD-0041', type: 'sos', caller: '+359 87 441 2298', region: 'Stara Zagora', description: 'SOS triggered — caller reported chest pain, 112 contacted, family notified', time: 'Today, 11:42 AM', status: 'resolved' },
  { id: 'MOD-0040', type: 'sos', caller: '+359 88 992 3310', region: 'Sofia', description: 'SOS triggered — fall reported during call, family app alerted immediately', time: 'Today, 9:18 AM', status: 'resolved' },
  { id: 'MOD-0039', type: 'pattern', caller: '+359 87 113 4422', region: 'Varna', description: '14 calls within 2 hours — possible confusion episode, no SOS triggered', time: 'Today, 8:55 AM', status: 'pending' },
  { id: 'MOD-0038', type: 'pattern', caller: '+359 89 558 1190', region: 'Plovdiv', description: '6 payment attempts in 30 minutes — all rejected, no funds transferred', time: 'Yesterday, 6:12 PM', status: 'pending' },
  { id: 'MOD-0037', type: 'anomaly', caller: '+359 88 224 7791', region: 'Sofia', description: 'Low confidence on all turns — caller voice unrecognised, possible phone handover', time: 'Yesterday, 4:40 PM', status: 'pending' },
  { id: 'MOD-0036', type: 'sos', caller: '+359 87 881 0034', region: 'Burgas', description: 'SOS triggered — caller said "I need help", agent escalated and called 112', time: 'Yesterday, 2:14 PM', status: 'resolved' },
  { id: 'MOD-0035', type: 'pattern', caller: '+359 89 334 1122', region: 'Sofia', description: 'Same phrase repeated 8 times — possible looping behaviour, call ended by timeout', time: 'Yesterday, 11:30 AM', status: 'resolved' },
  { id: 'MOD-0034', type: 'anomaly', caller: '+359 88 771 5590', region: 'Stara Zagora', description: 'Caller requested money transfer to unknown contact — blocked pending family approval', time: '2 days ago, 7:22 PM', status: 'resolved' },
  { id: 'MOD-0033', type: 'sos', caller: '+359 87 209 4411', region: 'Plovdiv', description: 'SOS triggered — caller mentioned feeling unwell, family and GP contact notified', time: '2 days ago, 3:48 PM', status: 'resolved' },
  { id: 'MOD-0032', type: 'pattern', caller: '+359 88 660 2277', region: 'Varna', description: '9 calls in 3 hours, all asking same question — memory check showed no stored answer', time: '2 days ago, 1:10 PM', status: 'resolved' },
]

const typeConfig: { [key: string]: { label: string; style: string } } = {
  sos: { label: 'SOS', style: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10' },
  pattern: { label: 'Pattern', style: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10' },
  anomaly: { label: 'Anomaly', style: 'text-[#7c73e6] border-[#7c73e6]/40 bg-[#7c73e6]/10' },
}

type Filter = 'all' | 'sos' | 'pattern' | 'anomaly' | 'pending'

export default function ModerationPage() {
  const [filter, setFilter] = useState<Filter>('all')

  const filtered = events.filter((e) => {
    if (filter === 'all') return true
    if (filter === 'pending') return e.status === 'pending'
    return e.type === filter
  })

  const sosCount = events.filter((e) => e.type === 'sos').length
  const pendingCount = events.filter((e) => e.status === 'pending').length
  const resolvedToday = events.filter((e) => e.status === 'resolved' && e.time.startsWith('Today')).length

  const tabClass = (f: Filter) =>
    `px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
      filter === f ? 'text-white bg-zinc-700' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
    }`

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white text-xl font-semibold">Moderation</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Flagged calls, SOS events, and unusual patterns</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-[#f87171]/40 bg-[#f87171]/10">
            <span className="w-2 h-2 rounded-full bg-[#f87171]" />
            <span className="text-[#f87171] text-sm font-medium">{pendingCount} pending review</span>
          </div>
        )}
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">SOS events today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">2</p>
            <p className="text-[#4ade80] text-sm mt-1.5">Both resolved</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Pending review</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{pendingCount}</p>
            <p className="text-[#fbbf24] text-sm mt-1.5">Needs attention</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Resolved today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{resolvedToday}</p>
            <p className="text-[#4ade80] text-sm mt-1.5">No action needed</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total SOS this month</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{sosCount}</p>
            <p className="text-zinc-400 text-sm mt-1.5">Last 10 shown</p>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-1 px-5 py-3 border-b border-zinc-800">
            <button onClick={() => setFilter('all')} className={tabClass('all')}>All</button>
            <button onClick={() => setFilter('sos')} className={tabClass('sos')}>SOS</button>
            <button onClick={() => setFilter('pattern')} className={tabClass('pattern')}>Pattern</button>
            <button onClick={() => setFilter('anomaly')} className={tabClass('anomaly')}>Anomaly</button>
            <button onClick={() => setFilter('pending')} className={tabClass('pending')}>Pending</button>
            <span className="ml-auto text-zinc-500 text-sm">{filtered.length} events</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Caller</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Time</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((event) => (
                <tr key={event.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3 font-mono text-zinc-400 text-xs">{event.id}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig[event.type].style}`}>
                      {typeConfig[event.type].label}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-white font-medium text-xs">{event.caller}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{event.region}</div>
                  </td>
                  <td className="px-5 py-3 text-zinc-400 text-xs" style={{ maxWidth: 320 }}>{event.description}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs whitespace-nowrap">{event.time}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      event.status === 'resolved'
                        ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10'
                        : 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-sm">
                    No events match this filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </PageShell>
  )
}
