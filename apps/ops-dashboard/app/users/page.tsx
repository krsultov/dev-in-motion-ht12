import { PageShell } from '@/components/PageShell'
import { UsersTable } from '@/components/UsersTable'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { SUBSCRIPTION_PRICE, PER_MINUTE_RATE } from '@/lib/pricing'

export type UserRecord = {
  _id: string
  name?: string
  phone: string
  memories?: string[]
  contacts?: unknown[]
  medications?: unknown[]
  preferences?: unknown[]
  createdAt: string
  updatedAt: string
}

export function getPlan(id: string): { type: 'subscription' | 'per-minute'; price: string } {
  return parseInt(id.slice(-2), 16) < 128
    ? { type: 'subscription', price: `€${SUBSCRIPTION_PRICE}/mo` }
    : { type: 'per-minute', price: `€${PER_MINUTE_RATE}/min` }
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

export default async function UsersPage() {
  const users = await getUsers()

  const subscriptionUsers = users.filter((u) => getPlan(u._id).type === 'subscription').length
  const perMinuteUsers = users.length - subscriptionUsers

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Users</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Registered', value: users.length },
            { label: 'Subscribed', value: subscriptionUsers },
            { label: 'Per-minute', value: perMinuteUsers },
          ].map((s, i) => (
            <div key={s.label} className="animate-fade-up bg-[#27272a] rounded-2xl px-5 py-5 border border-zinc-800" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-zinc-400 text-sm">{s.label}</p>
              <p className="text-3xl font-bold mt-2 leading-none tracking-tight text-white">{s.value}</p>
            </div>
          ))}
        </div>

        <AnalyticsCharts
          totalUsers={users.length}
          subscriptionUsers={subscriptionUsers}
          perMinuteUsers={perMinuteUsers}
        />

        <div className="overflow-y-auto max-h-[420px] rounded-2xl scrollbar-thin">
          <UsersTable users={users} />
        </div>
      </div>
    </PageShell>
  )
}
