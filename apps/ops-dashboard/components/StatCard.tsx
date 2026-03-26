type SparklineData = number[]

function Sparkline({ data }: { data: SparklineData }) {
  const svgWidth = 110
  const svgHeight = 38
  const barWidth = 10
  const barGap = 5
  const maxValue = Math.max(...data)

  const bars = data.map((value, index) => {
    const heightRatio = value / maxValue
    const barHeight = Math.max(4, heightRatio * svgHeight)
    const xPos = index * (barWidth + barGap)
    const yPos = svgHeight - barHeight
    const isLastBar = index === data.length - 1
    return { xPos, yPos, barHeight, isLastBar, index }
  })

  return (
    <svg width={svgWidth} height={svgHeight} className="flex-shrink-0">
      {bars.map((bar) => (
        <rect
          key={bar.index}
          x={bar.xPos}
          y={bar.yPos}
          width={barWidth}
          height={bar.barHeight}
          rx={2}
          fill="#7c73e6"
          opacity={bar.isLastBar ? 1 : 0.55}
        />
      ))}
    </svg>
  )
}

interface StatCardProps {
  title: string
  value: string
  trend: string
  trendUp: boolean | null
  sparkline: SparklineData
}

function getTrendColor(trendUp: boolean | null) {
  if (trendUp === true) return 'text-[#4ade80]'
  if (trendUp === false) return 'text-[#f87171]'
  return 'text-zinc-400'
}

export function StatCard({ title, value, trend, trendUp, sparkline }: StatCardProps) {
  const trendColor = getTrendColor(trendUp)

  return (
    <div className="bg-[#27272a] rounded-2xl p-5 flex flex-col gap-3 border border-zinc-800">
      <p className="text-zinc-400 text-sm leading-tight">{title}</p>
      <div className="flex items-end justify-between gap-2">
        <div>
          <p className="text-white text-3xl font-bold leading-none tracking-tight">{value}</p>
          <p className={`text-sm mt-1.5 leading-tight ${trendColor}`}>{trend}</p>
        </div>
        <Sparkline data={sparkline} />
      </div>
    </div>
  )
}
