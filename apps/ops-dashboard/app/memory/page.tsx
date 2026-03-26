import { PageShell } from '@/components/PageShell'

const topTopics = [
  { topic: 'Health & medications', count: 4218, pct: 100 },
  { topic: 'Transport & schedules', count: 3104, pct: 74 },
  { topic: 'Family contacts', count: 2841, pct: 67 },
  { topic: 'Reminders', count: 2190, pct: 52 },
  { topic: 'Payments & bills', count: 1482, pct: 35 },
  { topic: 'Government services', count: 984, pct: 23 },
  { topic: 'Shopping & errands', count: 721, pct: 17 },
  { topic: 'Weather & local info', count: 614, pct: 15 },
  { topic: 'Emergency contacts', count: 466, pct: 11 },
]

const topUsers = [
  { name: 'Vasil Georgiev', phone: '+359 88 556 7788', region: 'Sofia', memories: 148, lastMemory: 'Today, 10:02 AM' },
  { name: 'Georgi Marinov', phone: '+359 88 102 8874', region: 'Sofia', memories: 124, lastMemory: 'Today, 11:15 AM' },
  { name: 'Hristo Nikolov', phone: '+359 87 119 8821', region: 'Burgas', memories: 118, lastMemory: 'Yesterday, 4:12 PM' },
  { name: 'Dimitar Petrov', phone: '+359 88 412 3847', region: 'Sofia', memories: 104, lastMemory: 'Today, 11:47 AM' },
  { name: 'Stefan Petkov', phone: '+359 88 234 7712', region: 'Plovdiv', memories: 98, lastMemory: 'Yesterday, 6:43 PM' },
  { name: 'Plamen Ivanov', phone: '+359 89 556 0033', region: 'Plovdiv', memories: 91, lastMemory: 'Yesterday, 2:18 PM' },
  { name: 'Todor Hristov', phone: '+359 88 667 2233', region: 'Sofia', memories: 88, lastMemory: 'Today, 9:31 AM' },
  { name: 'Petya Koleva', phone: '+359 87 445 9901', region: 'Varna', memories: 74, lastMemory: 'Today, 10:29 AM' },
  { name: 'Irina Stoyanova', phone: '+359 87 321 8844', region: 'Plovdiv', memories: 62, lastMemory: 'Today, 9:48 AM' },
  { name: 'Denitsa Tsanova', phone: '+359 87 228 4477', region: 'Sofia', memories: 58, lastMemory: 'Yesterday, 1:05 PM' },
]

export default function MemoryPage() {
  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Memory stats</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total memories stored</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">14,820</p>
            <p className="text-[#4ade80] text-sm mt-1.5">+284 today</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Avg per user</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">11.5</p>
            <p className="text-[#4ade80] text-sm mt-1.5">+0.3 vs last week</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Retrievals today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">1,840</p>
            <p className="text-zinc-400 text-sm mt-1.5">Across all calls</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Avg retrieval/call</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">3.6</p>
            <p className="text-zinc-400 text-sm mt-1.5">Memories per session</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <h3 className="text-white font-semibold text-base mb-1">Most common topics</h3>
            <p className="text-zinc-500 text-sm mb-5">What users ask Nelson to remember</p>
            <div className="space-y-3.5">
              {topTopics.map((item) => (
                <div key={item.topic}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-zinc-300 text-sm">{item.topic}</span>
                    <span className="text-zinc-400 text-sm">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#7c73e6]"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-base">Most active users</h3>
              <p className="text-zinc-500 text-sm mt-0.5">Ranked by memory count</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-left border-b border-zinc-800">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Region</th>
                  <th className="px-5 py-3 font-medium">Memories</th>
                  <th className="px-5 py-3 font-medium">Last stored</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, i) => (
                  <tr key={user.phone} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-5 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-zinc-600 text-xs w-4 text-right flex-shrink-0">{i + 1}</span>
                        <div>
                          <div className="text-white font-medium text-xs">{user.name}</div>
                          <div className="text-zinc-500 text-xs mt-0.5">{user.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-2.5 text-zinc-300 text-xs">{user.region}</td>
                    <td className="px-5 py-2.5 text-white font-semibold text-xs">{user.memories}</td>
                    <td className="px-5 py-2.5 text-zinc-500 text-xs">{user.lastMemory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
