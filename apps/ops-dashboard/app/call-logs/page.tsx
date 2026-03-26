'use client'

import { useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { Search } from 'lucide-react'

const callLogs = [
  { id: 'CL-3841', user: 'Dimitar Petrov', phone: '+359 88 412 3847', region: 'Sofia', duration: '4m 22s', status: 'completed', tasks: 3, time: 'Today, 11:47 AM' },
  { id: 'CL-3840', user: 'Marta Ivanova', phone: '+359 89 762 1204', region: 'Plovdiv', duration: '2m 08s', status: 'completed', tasks: 1, time: 'Today, 11:31 AM' },
  { id: 'CL-3839', user: 'Unknown', phone: '+359 87 590 3312', region: 'Varna', duration: '0m 47s', status: 'failed', tasks: 0, time: 'Today, 11:28 AM' },
  { id: 'CL-3838', user: 'Georgi Marinov', phone: '+359 88 102 8874', region: 'Sofia', duration: '6m 14s', status: 'completed', tasks: 4, time: 'Today, 11:15 AM' },
  { id: 'CL-3837', user: 'Elena Todorova', phone: '+359 89 234 5678', region: 'Burgas', duration: '3m 51s', status: 'completed', tasks: 2, time: 'Today, 10:58 AM' },
  { id: 'CL-3836', user: 'Nikolay Dimitrov', phone: '+359 88 998 1122', region: 'Sofia', duration: '1m 33s', status: 'dropped', tasks: 0, time: 'Today, 10:44 AM' },
  { id: 'CL-3835', user: 'Petya Koleva', phone: '+359 87 445 9901', region: 'Varna', duration: '5m 07s', status: 'completed', tasks: 3, time: 'Today, 10:29 AM' },
  { id: 'CL-3834', user: 'Unknown', phone: '+359 89 113 4455', region: 'Stara Zagora', duration: '0m 22s', status: 'failed', tasks: 0, time: 'Today, 10:17 AM' },
  { id: 'CL-3833', user: 'Vasil Georgiev', phone: '+359 88 556 7788', region: 'Sofia', duration: '7m 38s', status: 'completed', tasks: 5, time: 'Today, 10:02 AM' },
  { id: 'CL-3832', user: 'Irina Stoyanova', phone: '+359 87 321 8844', region: 'Plovdiv', duration: '2m 54s', status: 'completed', tasks: 2, time: 'Today, 9:48 AM' },
  { id: 'CL-3831', user: 'Todor Hristov', phone: '+359 88 667 2233', region: 'Sofia', duration: '4m 10s', status: 'completed', tasks: 3, time: 'Today, 9:31 AM' },
  { id: 'CL-3830', user: 'Unknown', phone: '+359 89 780 6612', region: 'Stara Zagora', duration: '0m 31s', status: 'failed', tasks: 0, time: 'Today, 9:18 AM' },
  { id: 'CL-3829', user: 'Maria Angelova', phone: '+359 87 892 3301', region: 'Varna', duration: '3m 22s', status: 'dropped', tasks: 1, time: 'Yesterday, 7:51 PM' },
  { id: 'CL-3828', user: 'Stefan Petkov', phone: '+359 88 234 7712', region: 'Plovdiv', duration: '5m 45s', status: 'completed', tasks: 4, time: 'Yesterday, 6:43 PM' },
  { id: 'CL-3827', user: 'Kristina Boneva', phone: '+359 89 445 1199', region: 'Sofia', duration: '2m 17s', status: 'completed', tasks: 1, time: 'Yesterday, 5:30 PM' },
  { id: 'CL-3826', user: 'Hristo Nikolov', phone: '+359 87 119 8821', region: 'Burgas', duration: '6m 52s', status: 'completed', tasks: 4, time: 'Yesterday, 4:12 PM' },
  { id: 'CL-3825', user: 'Ana Mihailova', phone: '+359 88 773 4456', region: 'Sofia', duration: '1m 08s', status: 'dropped', tasks: 0, time: 'Yesterday, 3:01 PM' },
  { id: 'CL-3824', user: 'Plamen Ivanov', phone: '+359 89 556 0033', region: 'Plovdiv', duration: '4m 39s', status: 'completed', tasks: 3, time: 'Yesterday, 2:18 PM' },
  { id: 'CL-3823', user: 'Denitsa Tsanova', phone: '+359 87 228 4477', region: 'Sofia', duration: '3m 14s', status: 'completed', tasks: 2, time: 'Yesterday, 1:05 PM' },
  { id: 'CL-3822', user: 'Unknown', phone: '+359 88 991 2255', region: 'Stara Zagora', duration: '0m 18s', status: 'failed', tasks: 0, time: 'Yesterday, 12:34 PM' },
]

const statusConfig: Record<string, { label: string; style: string }> = {
  completed: { label: 'Completed', style: 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10' },
  failed: { label: 'Failed', style: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10' },
  dropped: { label: 'Dropped', style: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10' },
}

type FilterStatus = 'all' | 'completed' | 'failed' | 'dropped'

const filterTabs: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'completed', label: 'Completed' },
  { key: 'failed', label: 'Failed' },
  { key: 'dropped', label: 'Dropped' },
]

export default function CallLogsPage() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [query, setQuery] = useState('')

  const filtered = callLogs.filter((call) => {
    const matchesStatus = activeFilter === 'all' || call.status === activeFilter
    const matchesQuery =
      query === '' ||
      call.user.toLowerCase().includes(query.toLowerCase()) ||
      call.phone.includes(query) ||
      call.region.toLowerCase().includes(query.toLowerCase()) ||
      call.id.toLowerCase().includes(query.toLowerCase())
    return matchesStatus && matchesQuery
  })

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white text-xl font-semibold">Call logs</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{callLogs.length} records · today and yesterday</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
          <Search size={14} className="text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search calls…"
            className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-44"
          />
        </div>
      </header>

      <div className="flex-1 px-7 py-6 pb-8">
        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <div className="flex items-center gap-1 px-5 py-3 border-b border-zinc-800">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  activeFilter === tab.key
                    ? 'text-white bg-zinc-700'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
            <span className="ml-auto text-zinc-500 text-sm">{filtered.length} results</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-left border-b border-zinc-800">
                  <th className="px-5 py-3 font-medium">Call ID</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Region</th>
                  <th className="px-5 py-3 font-medium">Duration</th>
                  <th className="px-5 py-3 font-medium">Tasks</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((call) => (
                  <tr key={call.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-3 font-mono text-zinc-400 text-xs">{call.id}</td>
                    <td className="px-5 py-3">
                      <div className="text-white font-medium">{call.user}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{call.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-zinc-300">{call.region}</td>
                    <td className="px-5 py-3 text-zinc-300">{call.duration}</td>
                    <td className="px-5 py-3 text-zinc-300">{call.tasks}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig[call.status].style}`}
                      >
                        {statusConfig[call.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-zinc-500 text-xs">{call.time}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-zinc-500 text-sm">
                      No calls match your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-zinc-500 text-sm">Showing {filtered.length} of {callLogs.length} calls</p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">Previous</button>
              <button className="px-3 py-1.5 text-sm text-white bg-zinc-700 rounded-lg">1</button>
              <button className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">2</button>
              <button className="px-3 py-1.5 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">Next</button>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
