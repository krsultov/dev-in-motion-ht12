import { PageShell } from '@/components/PageShell'
import { CostCalculator } from '@/components/CostCalculator'
import { getPlan } from '@/app/users/page'
import type { UserRecord } from '@/app/users/page'

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

export default async function CalculatorPage() {
  const users = await getUsers()
  const subscriptionUsers = users.filter((u) => getPlan(u).type === 'subscription').length
  const perMinuteUsers = users.length - subscriptionUsers

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white text-xl font-semibold">Cost calculator</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Nelson costs €0.10 per minute to run</p>
        </div>
      </header>

      <div className="flex-1 px-7 py-6 pb-8 animate-fade-up">
        <CostCalculator
          totalUsers={users.length}
          subscriptionUsers={subscriptionUsers}
          perMinuteUsers={perMinuteUsers}
        />
      </div>
    </PageShell>
  )
}
