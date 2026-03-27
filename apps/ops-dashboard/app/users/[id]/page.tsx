import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PageShell } from '@/components/PageShell'

type UserDetail = {
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

async function getUser(id: string): Promise<UserDetail | null> {
  try {
    const res = await fetch(
      `${process.env.USER_DATA_API_URL ?? 'http://localhost:3002'}/userData/${id}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name?: string, phone?: string) {
  if (name) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  }
  return phone?.slice(-2) ?? '??'
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getUser(id)

  if (!user) notFound()

  const stats = [
    { label: 'Memories', value: user.memories?.length ?? 0 },
    { label: 'Contacts', value: user.contacts?.length ?? 0 },
    { label: 'Medications', value: user.medications?.length ?? 0 },
    { label: 'Preferences', value: user.preferences?.length ?? 0 },
  ]

  return (
    <PageShell>
      <header className="flex items-center gap-4 px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <Link href="/users" className="text-zinc-500 hover:text-white transition-colors text-sm">
          ← Users
        </Link>
        <span className="text-zinc-700">/</span>
        <h1 className="text-white text-xl font-semibold">{user.name ?? user.phone}</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#2e2b5c] flex items-center justify-center text-[#7c73e6] font-bold text-base flex-shrink-0">
            {initials(user.name, user.phone)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-base">{user.name ?? 'Unknown'}</p>
            <p className="text-zinc-400 text-sm">{user.phone}</p>
          </div>
          <div className="text-right flex-shrink-0 space-y-1">
            <div>
              <p className="text-zinc-500 text-xs">Joined</p>
              <p className="text-zinc-300 text-sm">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-zinc-500 text-xs">Last updated</p>
              <p className="text-zinc-300 text-sm">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
              <p className="text-zinc-400 text-sm">{s.label}</p>
              <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
