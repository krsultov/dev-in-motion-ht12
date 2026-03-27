import { PageShell } from '@/components/PageShell'
import { AnalyticsCharts } from '@/components/AnalyticsCharts'
import { getPlan } from '@/app/users/page'
import type { UserRecord } from '@/app/users/page'
import { SUBSCRIPTION_PRICE, PER_MINUTE_RATE, NELSON_COST_PER_MIN } from '@/lib/pricing'

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

export default async function AnalyticsPage() {
  const users = await getUsers()

  const subscriptionUsers = users.filter((u) => getPlan(u._id).type === 'subscription').length
  const perMinuteUsers = users.length - subscriptionUsers
  const monthlyRevenue = subscriptionUsers * SUBSCRIPTION_PRICE + perMinuteUsers * 45 * PER_MINUTE_RATE
  const monthlyCost = users.length * 45 * NELSON_COST_PER_MIN
  const profit = monthlyRevenue - monthlyCost

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Analytics</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total users', value: `${users.length}`, sub: `${subscriptionUsers} sub · ${perMinuteUsers} per-min`, color: 'text-white' },
            { label: 'Est. monthly revenue', value: `€${monthlyRevenue.toFixed(0)}`, sub: `subs × €${SUBSCRIPTION_PRICE} + p/m × 45min × €${PER_MINUTE_RATE}`, color: 'text-white' },
            { label: 'Nelson cost', value: `€${monthlyCost.toFixed(0)}`, sub: `all users × 45min avg × €${NELSON_COST_PER_MIN}/min`, color: 'text-white' },
            { label: 'Est. profit', value: `€${profit.toFixed(0)}`, sub: 'revenue − cost · use calculator for detail', color: profit >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]' },
          ].map((s, i) => (
            <div key={s.label} className="animate-fade-up bg-[#27272a] rounded-2xl p-5 border border-zinc-800" style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-zinc-400 text-sm">{s.label}</p>
              <p className={`text-3xl font-bold mt-2 leading-none tracking-tight ${s.color}`}>{s.value}</p>
              <p className="text-zinc-600 text-xs mt-2">{s.sub}</p>
            </div>
          ))}
        </div>

        <AnalyticsCharts
          totalUsers={users.length}
          subscriptionUsers={subscriptionUsers}
          perMinuteUsers={perMinuteUsers}
        />
      </div>
    </PageShell>
  )
}
