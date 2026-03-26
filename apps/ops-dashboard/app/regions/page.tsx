import { PageShell } from '@/components/PageShell'

const regions = [
  {
    name: 'Sofia',
    villages: ['Sofia', 'Bankya', 'Novi Iskar', 'Buhovo', 'Lozen'],
    registered: 1284,
    active: 612,
    callsToday: 241,
    status: 'healthy',
    coverage: 94,
  },
  {
    name: 'Plovdiv',
    villages: ['Plovdiv', 'Asenovgrad', 'Karlovo', 'Sopot', 'Hisarya'],
    registered: 598,
    active: 284,
    callsToday: 98,
    status: 'healthy',
    coverage: 88,
  },
  {
    name: 'Varna',
    villages: ['Varna', 'Devnya', 'Aksakovo', 'Byala', 'Provadiya'],
    registered: 412,
    active: 198,
    callsToday: 67,
    status: 'slow',
    coverage: 71,
  },
  {
    name: 'Burgas',
    villages: ['Burgas', 'Nessebar', 'Sunny Beach', 'Sozopol', 'Pomorie'],
    registered: 257,
    active: 121,
    callsToday: 38,
    status: 'healthy',
    coverage: 82,
  },
  {
    name: 'Stara Zagora',
    villages: ['Stara Zagora', 'Kazanlak', 'Chirpan', 'Radnevo', 'Gurkovo'],
    registered: 148,
    active: 69,
    callsToday: 14,
    status: 'error',
    coverage: 44,
  },
  {
    name: 'Ruse',
    villages: ['Ruse', 'Byala', 'Vetovo', 'Slivo Pole', 'Ivanovo'],
    registered: 118,
    active: 52,
    callsToday: 19,
    status: 'healthy',
    coverage: 76,
  },
  {
    name: 'Pleven',
    villages: ['Pleven', 'Levski', 'Lukovit', 'Cherven Bryag', 'Knezha'],
    registered: 94,
    active: 41,
    callsToday: 12,
    status: 'healthy',
    coverage: 68,
  },
  {
    name: 'Sliven',
    villages: ['Sliven', 'Nova Zagora', 'Kotel', 'Tvarditsa', 'Kermen'],
    registered: 72,
    active: 28,
    callsToday: 8,
    status: 'slow',
    coverage: 52,
  },
  {
    name: 'Shumen',
    villages: ['Shumen', 'Veliki Preslav', 'Novi Pazar', 'Kaspichan', 'Vetrino'],
    registered: 58,
    active: 21,
    callsToday: 6,
    status: 'healthy',
    coverage: 61,
  },
  {
    name: 'Dobrich',
    villages: ['Dobrich', 'Balchik', 'Kavarna', 'Shabla', 'Tervel'],
    registered: 44,
    active: 14,
    callsToday: 4,
    status: 'healthy',
    coverage: 55,
  },
]

const statusStyles: { [key: string]: string } = {
  healthy: 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  slow: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  error: 'text-[#f87171] border-[#f87171]/40 bg-[#f87171]/10',
}

const coverageColor = (pct: number) => {
  if (pct >= 80) return '#4ade80'
  if (pct >= 60) return '#fbbf24'
  return '#f87171'
}

export default function RegionsPage() {
  const totalRegistered = regions.reduce((sum, r) => sum + r.registered, 0)
  const totalActive = regions.reduce((sum, r) => sum + r.active, 0)
  const totalCallsToday = regions.reduce((sum, r) => sum + r.callsToday, 0)

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <div>
          <h1 className="text-white text-xl font-semibold">Regions</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Registered numbers by village and region</p>
        </div>
      </header>

      <div className="flex-1 px-7 py-6 space-y-5 pb-8">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Total registered</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{totalRegistered.toLocaleString()}</p>
            <p className="text-[#4ade80] text-sm mt-1.5">Across {regions.length} regions</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Active today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{totalActive.toLocaleString()}</p>
            <p className="text-zinc-400 text-sm mt-1.5">{Math.round((totalActive / totalRegistered) * 100)}% of registered</p>
          </div>
          <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
            <p className="text-zinc-400 text-sm">Calls today</p>
            <p className="text-white text-3xl font-bold mt-2 leading-none tracking-tight">{totalCallsToday}</p>
            <p className="text-zinc-400 text-sm mt-1.5">Across all regions</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {regions.map((region) => (
            <div key={region.name} className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold text-base">{region.name}</h3>
                  <p className="text-zinc-500 text-xs mt-0.5">{region.villages.join(', ')}</p>
                </div>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[region.status]}`}>
                  {region.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="text-zinc-500 text-xs">Registered</p>
                  <p className="text-white font-semibold mt-0.5">{region.registered.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Active today</p>
                  <p className="text-white font-semibold mt-0.5">{region.active}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs">Calls today</p>
                  <p className="text-white font-semibold mt-0.5">{region.callsToday}</p>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-zinc-500 text-xs">Network coverage</span>
                  <span className="text-xs font-medium" style={{ color: coverageColor(region.coverage) }}>{region.coverage}%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${region.coverage}%`, backgroundColor: coverageColor(region.coverage) }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  )
}
