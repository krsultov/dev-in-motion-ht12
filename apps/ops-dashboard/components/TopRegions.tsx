const regions = [
  { city: 'Sofia', users: 612, calls: 1840, status: 'healthy' },
  { city: 'Plovdiv', users: 284, calls: 739, status: 'healthy' },
  { city: 'Varna', users: 198, calls: 504, status: 'slow' },
  { city: 'Burgas', users: 121, calls: 288, status: 'healthy' },
  { city: 'Stara Zagora', users: 69, calls: 143, status: 'error' },
]

const statusStyles: Record<string, string> = {
  healthy: 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  slow: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  error: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
}

export function TopRegions() {
  return (
    <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800 flex flex-col">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base">Top regions</h3>
        <p className="text-zinc-500 text-sm">Active users by city</p>
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
              <td className="py-3 text-zinc-300">{row.users}</td>
              <td className="py-3 text-zinc-300">{row.calls.toLocaleString()}</td>
              <td className="py-3">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[row.status]}`}
                >
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
