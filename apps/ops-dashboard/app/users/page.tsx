import { PageShell } from '@/components/PageShell'
import { UsersTable } from '@/components/UsersTable'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { SUBSCRIPTION_PRICE, PER_MINUTE_RATE } from '@/lib/pricing'

export type UserRecord = {
  _id: string
  name?: string
  phone: string
  plan?: 'subscription' | 'per-minute'
  memories?: string[]
  contacts?: unknown[]
  medications?: unknown[]
  preferences?: unknown[]
  memoriesCount?: number
  callMinutes?: number
  createdAt: string
  updatedAt: string
}

export function getPlan(user: UserRecord): { type: 'subscription' | 'per-minute'; price: string } {
  const planType = user.plan ?? 'per-minute'
  return planType === 'subscription'
    ? { type: 'subscription', price: `€${SUBSCRIPTION_PRICE}/mo` }
    : { type: 'per-minute', price: `€${PER_MINUTE_RATE}/min` }
}

type StatsOverview = {
  totalUsers: number
  usersByMonth: Array<{ month: string; count: number }>
  totalCalls: number
  callsByMonth: Array<{ month: string; count: number }>
  avgCallDurationSec: number
  totalCallMinutes: number
  minutesByMonth: Array<{ month: string; minutes: number }>
  planDistribution: { subscription: number; perMinute: number }
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

async function getMemoryCount(phone: string): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/memories?userId=${encodeURIComponent(phone)}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return 0
    const data = await res.json()
    return Array.isArray(data) ? data.length : 0
  } catch {
    return 0
  }
}

async function getStats(): Promise<StatsOverview | null> {
  try {
    const res = await fetch(
      `${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/stats/overview`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getCallMinutesByUser(): Promise<Record<string, number>> {
  try {
    const res = await fetch(
      `${process.env.MEMORIES_API_URL ?? 'http://localhost:3001'}/stats/call-minutes-by-user`,
      { cache: 'no-store' },
    )
    if (!res.ok) return {}
    return res.json()
  } catch {
    return {}
  }
}

export default async function UsersPage() {
  const [users, stats, callMinutesByUser] = await Promise.all([getUsers(), getStats(), getCallMinutesByUser()])

  const memoryCounts = await Promise.all(users.map((u) => getMemoryCount(u.phone)))
  const usersWithCounts = users.map((u, i) => ({
    ...u,
    memoriesCount: memoryCounts[i],
    callMinutes: callMinutesByUser[u.phone] ?? 0,
  }))

  const subscriptionUsers = stats?.planDistribution.subscription
    ?? users.filter((u) => getPlan(u).type === 'subscription').length
  const perMinuteUsers = stats?.planDistribution.perMinute
    ?? (users.length - subscriptionUsers)

  const userGrowth = (stats?.usersByMonth ?? []).map((entry) => ({
    month: entry.month,
    users: entry.count,
  }))

  const totalCallMinutes = stats?.totalCallMinutes ?? 0
  const totalCalls = stats?.totalCalls ?? 0
  const avgMinutes = stats ? stats.avgCallDurationSec / 60 : 0
  const minutesByMonth = (stats?.minutesByMonth ?? []).map((entry) => ({
    month: entry.month,
    minutes: entry.minutes,
  }))
  const revenueData = (stats?.callsByMonth ?? []).map((entry) => ({
    month: entry.month,
    subscription: Math.round(subscriptionUsers * SUBSCRIPTION_PRICE * (entry.count / Math.max(stats!.totalCalls, 1))),
    perMinute: Math.round(perMinuteUsers * avgMinutes * PER_MINUTE_RATE * (entry.count / Math.max(stats!.totalCalls, 1))),
  }))

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Users</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Registered', value: users.length },
            { label: 'Subscribed', value: subscriptionUsers },
            { label: 'Per-minute', value: perMinuteUsers },
            { label: 'Total calls', value: totalCalls },
            { label: 'Call minutes', value: totalCallMinutes },
          ].map((s, i) => (
            <div key={s.label} className="animate-fade-up bg-[#27272a] rounded-2xl px-5 py-5 border border-zinc-800" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-zinc-400 text-sm">{s.label}</p>
              <p className="text-3xl font-bold mt-2 leading-none tracking-tight text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <AnalyticsCharts
          subscriptionUsers={subscriptionUsers}
          perMinuteUsers={perMinuteUsers}
          userGrowth={userGrowth}
          revenueData={revenueData}
          minutesByMonth={minutesByMonth}
        />

        <div className="rounded-2xl">
          <UsersTable users={usersWithCounts} />
        </div>
      </div>
    </PageShell>
  )
}
