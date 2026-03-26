'use client'

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const data7 = [
  { name: 'Appointments', value: 40, color: '#7c73e6' },
  { name: 'Calls placed', value: 20, color: '#4ade80' },
  { name: 'Purchases', value: 14, color: '#fbbf24' },
  { name: 'Info lookups', value: 26, color: '#52525b' },
]

const data14 = [
  { name: 'Appointments', value: 38, color: '#7c73e6' },
  { name: 'Calls placed', value: 22, color: '#4ade80' },
  { name: 'Purchases', value: 15, color: '#fbbf24' },
  { name: 'Info lookups', value: 25, color: '#52525b' },
]

const data30 = [
  { name: 'Appointments', value: 42, color: '#7c73e6' },
  { name: 'Calls placed', value: 18, color: '#4ade80' },
  { name: 'Purchases', value: 16, color: '#fbbf24' },
  { name: 'Info lookups', value: 24, color: '#52525b' },
]

export function TaskBreakdownChart({ range }: { range: string }) {
  let data = data7
  let centerLabel = '2,510'
  let subtitle = 'By category · last 7 days'

  if (range === '14') {
    data = data14
    centerLabel = '5,620'
    subtitle = 'By category · last 14 days'
  } else if (range === '30') {
    data = data30
    centerLabel = '14.3k'
    subtitle = 'By category · last 30 days'
  }

  return (
    <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base">Task breakdown</h3>
        <p className="text-zinc-500 text-sm">{subtitle}</p>
      </div>

      <div className="relative flex items-center justify-center" style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={68}
              outerRadius={92}
              paddingAngle={2}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              strokeWidth={0}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white text-2xl font-bold">{centerLabel}</span>
        </div>
      </div>

      <ul className="mt-4 space-y-2">
        {data.map((item) => (
          <li key={item.name} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-zinc-300">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="text-zinc-400 font-medium">{item.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
