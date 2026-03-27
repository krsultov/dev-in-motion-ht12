import { PageShell } from '@/components/PageShell'

type Reminder = {
  _id: string
  title: string
  endTime: string
  cron?: string
  description?: string
  createdAt: string
  updatedAt: string
}

async function getReminders(): Promise<Reminder[]> {
  try {
    const res = await fetch(
      `${process.env.REMINDERS_API_URL ?? 'http://localhost:3004'}/reminders`,
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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function RemindersPage() {
  const reminders = await getReminders()
  const recurring = reminders.filter((r) => !!r.cron).length
  const oneTime = reminders.length - recurring

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Reminders</h1>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{reminders.length}</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Recurring</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{recurring}</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">One-time</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{oneTime}</p>
          </div>
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-500 text-left border-b border-zinc-800">
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Ends</th>
                <th className="px-5 py-3 font-medium">Schedule</th>
                <th className="px-5 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((reminder) => (
                <tr key={reminder._id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-white font-medium">{reminder.title}</div>
                    {reminder.description && (
                      <div className="text-zinc-500 text-xs mt-0.5">{reminder.description}</div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-zinc-300 text-xs">{formatDateTime(reminder.endTime)}</td>
                  <td className="px-5 py-3">
                    {reminder.cron ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#7c73e6] bg-[#2e2b5c] px-2 py-0.5 rounded-full font-mono">
                        {reminder.cron}
                      </span>
                    ) : (
                      <span className="text-zinc-600 text-xs">one-time</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{formatDate(reminder.createdAt)}</td>
                </tr>
              ))}
              {reminders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-10 text-center text-zinc-500 text-sm">
                    No reminders found
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
