import Link from 'next/link'
import { PageShell } from '@/components/PageShell'

type UserRecord = {
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

function initials(name?: string, phone?: string) {
  if (name) {
    return name
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }
  return phone?.slice(-2) ?? '??'
}

const avatarColors = [
  'bg-[#2e2b5c] text-[#7c73e6]',
  'bg-[#1e3a5f] text-blue-300',
  'bg-[#1a3a2a] text-[#4ade80]',
  'bg-[#3a2a1a] text-[#fbbf24]',
  'bg-[#3a1a1a] text-[#f87171]',
]

export default async function UsersPage() {
  const users = await getUsers()
  const withMemories = users.filter((u) => (u.memories?.length ?? 0) > 0).length

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white text-xl font-semibold">Users</h1>
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total users</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none">{users.length}</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">With memories</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none">{withMemories}</p>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">User</th>
                <th className="px-5 py-3 font-medium">Memories</th>
                <th className="px-5 py-3 font-medium">Contacts</th>
                <th className="px-5 py-3 font-medium">Medications</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <tr key={user._id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                        {initials(user.name, user.phone)}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name ?? 'Unknown'}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{user.memories?.length ?? 0}</td>
                  <td className="px-5 py-3 text-zinc-300">{user.contacts?.length ?? 0}</td>
                  <td className="px-5 py-3 text-zinc-300">{user.medications?.length ?? 0}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{formatDate(user.createdAt)}</td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/users/${user._id}`}
                      className="text-xs text-zinc-500 hover:text-white transition-colors"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-sm">
                    No users found
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
