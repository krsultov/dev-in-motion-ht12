import { Sidebar } from '@/components/Sidebar'
import { StatCard } from '@/components/StatCard'
import { CallsPerDayChart } from '@/components/CallsPerDayChart'
import { TaskBreakdownChart } from '@/components/TaskBreakdownChart'
import { TopRegions } from '@/components/TopRegions'
import { SystemAlerts } from '@/components/SystemAlerts'

const statCards = [
  {
    title: 'Active users',
    value: '1,284',
    trend: '+47 this week',
    trendUp: true,
    sparkline: [38, 44, 41, 55, 62, 58, 72],
  },
  {
    title: 'Calls today',
    value: '386',
    trend: '+12% vs yesterday',
    trendUp: true,
    sparkline: [280, 310, 295, 340, 355, 370, 386],
  },
  {
    title: 'Task success rate',
    value: '94.2%',
    trend: '-0.8% vs last week',
    trendUp: false,
    sparkline: [91, 93, 92, 95, 96, 94, 94],
  },
  {
    title: 'Avg. call duration',
    value: '3m 42s',
    trend: '+18s vs last week',
    trendUp: true,
    sparkline: [195, 188, 210, 220, 215, 228, 222],
  },
]

export default function DashboardPage() {
  return (
    <div
      className="flex h-screen bg-[#18181b] overflow-hidden"
      style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
    >
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
          <h1 className="text-white text-xl font-semibold">Overview dashboard</h1>
          <div className="flex items-center gap-2">
            <button className="px-3.5 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
              Today
            </button>
            <button className="px-3.5 py-1.5 text-sm text-white bg-zinc-700 rounded-lg font-medium">
              7 days
            </button>
            <button className="px-3.5 py-1.5 text-sm text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">
              30 days
            </button>
            <button className="ml-1 flex items-center gap-2 px-3.5 py-1.5 text-sm text-white rounded-lg border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 transition-colors">
              <span className="w-2 h-2 rounded-full bg-[#f87171] flex-shrink-0" />
              3 alerts
            </button>
          </div>
        </header>

        <div className="flex-1 px-7 py-6 space-y-5">
          <div className="grid grid-cols-4 gap-4">
            {statCards.map((card) => (
              <StatCard key={card.title} {...card} />
            ))}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-3">
              <CallsPerDayChart />
            </div>
            <div className="col-span-2">
              <TaskBreakdownChart />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-6">
            <TopRegions />
            <SystemAlerts />
          </div>
        </div>
      </main>
    </div>
  )
}