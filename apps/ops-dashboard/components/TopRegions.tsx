const regions7 = [
  { city: 'Sofia', users: 612, calls: 1840, status: 'healthy' },
  { city: 'Plovdiv', users: 284, calls: 739, status: 'healthy' },
  { city: 'Varna', users: 198, calls: 504, status: 'slow' },
  { city: 'Burgas', users: 121, calls: 288, status: 'healthy' },
  { city: 'Stara Zagora', users: 69, calls: 143, status: 'error' },
]

const regions14 = [
  { city: 'Sofia', users: 1180, calls: 3540, status: 'healthy' },
  { city: 'Plovdiv', users: 548, calls: 1420, status: 'healthy' },
  { city: 'Varna', users: 382, calls: 970, status: 'slow' },
  { city: 'Burgas', users: 233, calls: 554, status: 'healthy' },
  { city: 'Stara Zagora', users: 130, calls: 272, status: 'error' },
]

const regions30 = [
  { city: 'Sofia', users: 1284, calls: 7420, status: 'healthy' },
  { city: 'Plovdiv', users: 598, calls: 3108, status: 'healthy' },
  { city: 'Varna', users: 412, calls: 2043, status: 'healthy' },
  { city: 'Burgas', users: 257, calls: 1184, status: 'slow' },
  { city: 'Stara Zagora', users: 148, calls: 592, status: 'error' },
]

const statusStyles: { [key: string]: string } = {
  healthy: 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  slow: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  error: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
}

export function TopRegions({ range }: { range: string }) {
  let regions = regions7
  let subtitle = 'Active users · last 7 days'

  if (range === '14') {
    regions = regions14
    subtitle = 'Active users · last 14 days'
  } else if (range === '30') {
    regions = regions30
    subtitle = 'Active users · last 30 days'
  }

  return (
    <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800 flex flex-col">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base">Top regions</h3>
        <p className="text-zinc-500 text-sm">{subtitle}</p>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-zinc-500 text-left">
            <th className="pb-3 font-medium">City</th>
            <th className="pb-3 font-medium">Users</th>
            <th className="pb-3 font-medium">Calls</th>
            <th className="pb-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {regions.map((row) => (
            <tr key={row.city} className="border-t border-zinc-800">
              <td className="py-3 text-white font-medium">{row.city}</td>
              <td className="py-3 text-zinc-300">{row.users.toLocaleString()}</td>
              <td className="py-3 text-zinc-300">{row.calls.toLocaleString()}</td>
              <td className="py-3">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[row.status]}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
