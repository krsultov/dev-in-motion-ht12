'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data7 = [
  { day: 'Mon', calls: 310 },
  { day: 'Tue', calls: 370 },
  { day: 'Wed', calls: 290 },
  { day: 'Thu', calls: 420 },
  { day: 'Fri', calls: 340 },
  { day: 'Sat', calls: 270 },
  { day: 'Sun', calls: 510 },
]

const data14 = [
  { day: 'M', calls: 298 },
  { day: 'T', calls: 344 },
  { day: 'W', calls: 310 },
  { day: 'T', calls: 390 },
  { day: 'F', calls: 325 },
  { day: 'S', calls: 252 },
  { day: 'S', calls: 481 },
  { day: 'M', calls: 310 },
  { day: 'T', calls: 370 },
  { day: 'W', calls: 290 },
  { day: 'T', calls: 420 },
  { day: 'F', calls: 340 },
  { day: 'S', calls: 270 },
  { day: 'S', calls: 510 },
]

const data30 = [
  { day: '1 Mar', calls: 1840 },
  { day: '5 Mar', calls: 2100 },
  { day: '10 Mar', calls: 1950 },
  { day: '15 Mar', calls: 2380 },
  { day: '20 Mar', calls: 2210 },
  { day: '25 Mar', calls: 2050 },
  { day: '30 Mar', calls: 2420 },
]

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm">
        <p className="text-zinc-400">{label}</p>
        <p className="text-white font-semibold">{payload[0].value} calls</p>
      </div>
    )
  }
  return null
}

export function CallsPerDayChart({ range }: { range: string }) {
  let data = data7
  let subtitle = 'Last 7 days · all users'

  if (range === '14') {
    data = data14
    subtitle = 'Last 14 days · all users'
  } else if (range === '30') {
    data = data30
    subtitle = 'Last 30 days · weekly totals'
  }

  return (
    <div className="bg-[#27272a] rounded-2xl p-5 border border-zinc-800 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-white font-semibold text-base">Calls per day</h3>
        <p className="text-zinc-500 text-sm">{subtitle}</p>
      </div>
      <div className="flex-1" style={{ minHeight: 200 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} barCategoryGap="30%">
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 13 }}
              dy={8}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,115,230,0.08)' }} />
            <Bar dataKey="calls" radius={[6, 6, 6, 6]}>
              {data.map((entry, i) => (
                <Cell
                  key={`${entry.day}-${i}`}
                  fill={i === data.length - 1 ? '#7c73e6' : '#4a4580'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
