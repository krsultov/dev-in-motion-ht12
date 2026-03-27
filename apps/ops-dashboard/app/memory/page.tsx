import { PageShell } from '@/components/PageShell'

type SystemMemory = {
  id: string
  key: string
  value: string
  createdAt: string
  updatedAt: string
}

type UserRecord = {
  _id: string
  name?: string
  phone: string
  memories?: string[]
  createdAt: string
  updatedAt: string
}

async function getSystemMemories(): Promise<SystemMemory[]> {
  try {
    const res = await fetch(
      `${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/memories`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

async function getUsers(): Promise<UserRecord[]> {
  try {
    const res = await fetch(
      `${process.env.USER_DATA_API_URL ?? 'http://localhost:3002'}/userData`,
      { cache: 'no-store' },
    )
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function MemoryPage() {
  const [systemMemories, users] = await Promise.all([getSystemMemories(), getUsers()])

  const totalUserMemories = users.reduce((sum, u) => sum + (u.memories?.length ?? 0), 0)
  const avgPerUser = users.length > 0 ? (totalUserMemories / users.length).toFixed(1) : '0'

  const ranked = [...users]
    .sort((a, b) => (b.memories?.length ?? 0) - (a.memories?.length ?? 0))
    .filter((u) => (u.memories?.length ?? 0) > 0)

  const maxMemories = ranked[0]?.memories?.length ?? 1

  const recentlyActive = [...users]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 8)

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Memories</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">System memories</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{systemMemories.length}</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total user memories</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{totalUserMemories}</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Avg per user</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{avgPerUser}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-base">Most active users</h3>
              <p className="text-zinc-500 text-sm mt-0.5">Ranked by memory count</p>
            </div>
            <div className="divide-y divide-zinc-800">
              {ranked.map((user, i) => {
                const count = user.memories?.length ?? 0
                const pct = Math.round((count / maxMemories) * 100)
                return (
                  <div key={user._id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-600 text-xs w-4 flex-shrink-0">{i + 1}</span>
                        <div className="min-w-0">
                          <span className="text-white text-sm font-medium truncate block">{user.name ?? 'Unknown'}</span>
                          <span className="text-zinc-500 text-xs">{user.phone}</span>
                        </div>
                      </div>
                      <span className="text-white font-semibold text-sm flex-shrink-0 ml-3">{count}</span>
                    </div>
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7c73e6] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
              {ranked.length === 0 && (
                <div className="px-5 py-10 text-center text-zinc-500 text-sm">No user memories found</div>
              )}
            </div>
          </div>

          <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
              <h3 className="text-white font-semibold text-base">Recently active</h3>
              <p className="text-zinc-500 text-sm mt-0.5">Last profile update</p>
            </div>
            <div className="divide-y divide-zinc-800">
              {recentlyActive.map((user) => (
                <div key={user._id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium truncate">{user.name ?? 'Unknown'}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{user.phone}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-zinc-400 text-xs">{formatDate(user.updatedAt)}</p>
                    <p className="text-zinc-600 text-xs mt-0.5">{user.memories?.length ?? 0} memories</p>
                  </div>
                </div>
              ))}
              {recentlyActive.length === 0 && (
                <div className="px-5 py-10 text-center text-zinc-500 text-sm">No users found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
