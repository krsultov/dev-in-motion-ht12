const alerts = [
  {
    type: 'error',
    title: 'AI timeout — Stara Zagora',
    description: '12 calls failed in last hour',
    time: 'Today · 11:42 AM',
  },
  {
    type: 'warning',
    title: 'High latency — Varna node',
    description: 'Avg response +2.4s above baseline',
    time: 'Today · 10:15 AM',
  },
  {
    type: 'warning',
    title: 'Unusual purchase volume',
    description: '38 approvals pending >24h',
    time: 'Yesterday · 6:30 PM',
  },
]

function ErrorIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#f87171" strokeWidth="1.5" />
      <path d="M10 6v5" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14" r="0.75" fill="#f87171" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 3L18 17H2L10 3Z"
        stroke="#fbbf24"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 9v4" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="0.75" fill="#fbbf24" />
    </svg>
  )
}

export function SystemAlerts() {
  return (
    <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800 flex flex-col">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base">System alerts</h3>
        <p className="text-zinc-500 text-sm">Requires attention</p>
      </div>

      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li
            key={alert.title}
            className="flex items-start gap-3 bg-zinc-800/50 rounded-xl p-3.5"
          >
            <div className="mt-0.5 flex-shrink-0">
              {alert.type === 'error' ? <ErrorIcon /> : <WarningIcon />}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium leading-snug">{alert.title}</p>
              <p className="text-zinc-400 text-xs mt-0.5 leading-snug">{alert.description}</p>
              <p className="text-zinc-600 text-xs mt-1">{alert.time}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
