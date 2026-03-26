'use client'

import { useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { Search } from 'lucide-react'

const users = [
  { id: 'U-1041', initials: 'DP', name: 'Dimitar Petrov', phone: '+359 88 412 3847', region: 'Sofia', totalCalls: 48, avgDuration: '4m 12s', lastCall: 'Today, 11:47 AM', status: 'active' },
  { id: 'U-1040', initials: 'MI', name: 'Marta Ivanova', phone: '+359 89 762 1204', region: 'Plovdiv', totalCalls: 31, avgDuration: '3m 05s', lastCall: 'Today, 11:31 AM', status: 'active' },
  { id: 'U-1039', initials: 'GM', name: 'Georgi Marinov', phone: '+359 88 102 8874', region: 'Sofia', totalCalls: 72, avgDuration: '5m 48s', lastCall: 'Today, 11:15 AM', status: 'active' },
  { id: 'U-1038', initials: 'ET', name: 'Elena Todorova', phone: '+359 89 234 5678', region: 'Burgas', totalCalls: 19, avgDuration: '3m 21s', lastCall: 'Today, 10:58 AM', status: 'active' },
  { id: 'U-1037', initials: 'ND', name: 'Nikolay Dimitrov', phone: '+359 88 998 1122', region: 'Sofia', totalCalls: 55, avgDuration: '2m 44s', lastCall: 'Today, 10:44 AM', status: 'active' },
  { id: 'U-1036', initials: 'PK', name: 'Petya Koleva', phone: '+359 87 445 9901', region: 'Varna', totalCalls: 28, avgDuration: '4m 55s', lastCall: 'Today, 10:29 AM', status: 'active' },
  { id: 'U-1035', initials: 'VG', name: 'Vasil Georgiev', phone: '+359 88 556 7788', region: 'Sofia', totalCalls: 91, avgDuration: '6m 02s', lastCall: 'Today, 10:02 AM', status: 'active' },
  { id: 'U-1034', initials: 'IS', name: 'Irina Stoyanova', phone: '+359 87 321 8844', region: 'Plovdiv', totalCalls: 37, avgDuration: '3m 38s', lastCall: 'Today, 9:48 AM', status: 'active' },
  { id: 'U-1033', initials: 'TH', name: 'Todor Hristov', phone: '+359 88 667 2233', region: 'Sofia', totalCalls: 44, avgDuration: '4m 10s', lastCall: 'Today, 9:31 AM', status: 'active' },
  { id: 'U-1032', initials: 'MA', name: 'Maria Angelova', phone: '+359 87 892 3301', region: 'Varna', totalCalls: 22, avgDuration: '3m 44s', lastCall: 'Yesterday, 7:51 PM', status: 'inactive' },
  { id: 'U-1031', initials: 'SP', name: 'Stefan Petkov', phone: '+359 88 234 7712', region: 'Plovdiv', totalCalls: 63, avgDuration: '5m 12s', lastCall: 'Yesterday, 6:43 PM', status: 'active' },
  { id: 'U-1030', initials: 'KB', name: 'Kristina Boneva', phone: '+359 89 445 1199', region: 'Sofia', totalCalls: 14, avgDuration: '2m 28s', lastCall: 'Yesterday, 5:30 PM', status: 'inactive' },
  { id: 'U-1029', initials: 'HN', name: 'Hristo Nikolov', phone: '+359 87 119 8821', region: 'Burgas', totalCalls: 81, avgDuration: '5m 58s', lastCall: 'Yesterday, 4:12 PM', status: 'active' },
  { id: 'U-1028', initials: 'AM', name: 'Ana Mihailova', phone: '+359 88 773 4456', region: 'Sofia', totalCalls: 9, avgDuration: '1m 52s', lastCall: 'Yesterday, 3:01 PM', status: 'inactive' },
  { id: 'U-1027', initials: 'PI', name: 'Plamen Ivanov', phone: '+359 89 556 0033', region: 'Plovdiv', totalCalls: 52, avgDuration: '4m 20s', lastCall: 'Yesterday, 2:18 PM', status: 'active' },
  { id: 'U-1026', initials: 'DT', name: 'Denitsa Tsanova', phone: '+359 87 228 4477', region: 'Sofia', totalCalls: 38, avgDuration: '3m 30s', lastCall: 'Yesterday, 1:05 PM', status: 'active' },
  { id: 'U-1025', initials: 'BV', name: 'Borislav Vasilev', phone: '+359 88 341 9920', region: 'Stara Zagora', totalCalls: 6, avgDuration: '2m 05s', lastCall: '2 days ago', status: 'inactive' },
  { id: 'U-1024', initials: 'RK', name: 'Radoslava Kostadinova', phone: '+359 89 871 3348', region: 'Varna', totalCalls: 17, avgDuration: '3m 18s', lastCall: '2 days ago', status: 'inactive' },
]

const avatarColors = [
  'bg-[#2e2b5c] text-[#7c73e6]',
  'bg-[#1e3a5f] text-blue-300',
  'bg-[#1a3a2a] text-[#4ade80]',
  'bg-[#3a2a1a] text-[#fbbf24]',
  'bg-[#3a1a1a] text-[#f87171]',
]

type FilterStatus = 'all' | 'active' | 'inactive'

const filterTabs: { key: FilterStatus; label: string }[] = [
  { key: 'all', label: 'All users' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
]

export default function UsersPage() {
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')
  const [query, setQuery] = useState('')

  const filtered = users.filter((user) => {
    const matchesStatus = activeFilter === 'all' || user.status === activeFilter
    const matchesQuery =
      query === '' ||
      user.name.toLowerCase().includes(query.toLowerCase()) ||
      user.phone.includes(query) ||
      user.region.toLowerCase().includes(query.toLowerCase())
    return matchesStatus && matchesQuery
  })

  const activeCount = users.filter((u) => u.status === 'active').length
  const inactiveCount = users.filter((u) => u.status === 'inactive').length

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white text-xl font-semibold">Users</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{users.length} registered · {activeCount} active today</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-800 rounded-lg px-3 py-2">
          <Search size={14} className="text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users…"
            className="bg-transparent text-sm text-white placeholder-zinc-500 outline-none w-44"
          />
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total users</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none">{users.length}</p>
            <p className="text-[#4ade80] text-sm mt-1.5">+3 this week</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Active today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none">{activeCount}</p>
            <p className="text-[#4ade80] text-sm mt-1.5">+2 vs yesterday</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Inactive</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none">{inactiveCount}</p>
            <p className="text-zinc-400 text-sm mt-1.5">No change</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Avg. calls / user</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none">38.4</p>
            <p className="text-[#4ade80] text-sm mt-1.5">+4.1 vs last month</p>
          </div>
        </div>

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
            <span className="ml-auto text-zinc-500 text-sm">{filtered.length} users</span>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Region</th>
                <th className="px-5 py-3 font-medium">Total calls</th>
                <th className="px-5 py-3 font-medium">Avg. duration</th>
                <th className="px-5 py-3 font-medium">Last call</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, i) => (
                <tr key={user.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {user.initials}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{user.region}</td>
                  <td className="px-5 py-3 text-zinc-300">{user.totalCalls}</td>
                  <td className="px-5 py-3 text-zinc-300">{user.avgDuration}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{user.lastCall}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        user.status === 'active'
                          ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10'
                          : 'text-zinc-400 border-zinc-700 bg-zinc-800/50'
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-sm">
                    No users match your filters
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
