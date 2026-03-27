'use client'

import { useState, useCallback } from 'react'
import { X, TrendingUp } from 'lucide-react'

type LeaderboardUser = {
  phone: string
  name?: string
  minutes: number
}

function initials(name?: string, phone?: string) {
  if (name) return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  return phone?.slice(-2) ?? '??'
}

const avatarColors = [
  'bg-[#2e2b5c] text-[#7c73e6]',
  'bg-[#1e3a5f] text-blue-300',
  'bg-[#1a3a2a] text-[#4ade80]',
  'bg-[#3a2a1a] text-[#fbbf24]',
  'bg-[#3a1a1a] text-[#f87171]',
]

const podium = [
  {
    rank: '🥇',
    ring: 'ring-2 ring-[#fbbf24]/60',
    bg: 'bg-gradient-to-br from-[#3a2a1a] to-[#27272a]',
    bar: 'bg-gradient-to-r from-[#fbbf24] to-[#f59e0b]',
    label: 'text-[#fbbf24]',
  },
  {
    rank: '🥈',
    ring: 'ring-2 ring-zinc-400/40',
    bg: 'bg-gradient-to-br from-[#2a2a2a] to-[#27272a]',
    bar: 'bg-gradient-to-r from-zinc-400 to-zinc-500',
    label: 'text-zinc-300',
  },
  {
    rank: '🥉',
    ring: 'ring-2 ring-[#cd7f32]/50',
    bg: 'bg-gradient-to-br from-[#2a1e14] to-[#27272a]',
    bar: 'bg-gradient-to-r from-[#cd7f32] to-[#a0522d]',
    label: 'text-[#cd7f32]',
  },
]

export function TopUsersLeaderboard({
  users,
  maxMinutes,
}: {
  users: LeaderboardUser[]
  maxMinutes: number
}) {
  const [selected, setSelected] = useState<LeaderboardUser | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const closeModal = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => { setSelected(null); setIsClosing(false) }, 200)
  }, [])

  if (users.length === 0) return null

  return (
    <>
      <div className="animate-fade-up bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-2">
          <TrendingUp size={15} className="text-[#7c73e6]" />
          <h3 className="text-white font-semibold text-sm">Top users by call minutes</h3>
        </div>
        <div className="divide-y divide-zinc-800">
          {users.map((u, i) => {
            const p = podium[i]
            const pct = Math.round((u.minutes / maxMinutes) * 100)
            return (
              <div
                key={u.phone}
                className={`animate-fade-up flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/30 transition-colors ${p ? p.bg : ''}`}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Rank */}
                <span className="text-sm w-6 text-center flex-shrink-0 leading-none">
                  {p ? p.rank : <span className="text-xs font-bold text-zinc-600">{i + 1}</span>}
                </span>

                {/* Avatar */}
                <button
                  onClick={() => setSelected(u)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer transition-all hover:scale-110 ${avatarColors[i % avatarColors.length]} ${p ? p.ring : ''}`}
                >
                  {initials(u.name, u.phone)}
                </button>

                {/* Name + phone */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium leading-tight truncate ${p ? p.label : 'text-white'}`}>
                    {u.name ?? 'Unknown'}
                  </div>
                  <div className="text-zinc-500 text-xs mt-0.5 truncate">{u.phone}</div>
                </div>

                {/* Bar + minutes */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-28 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${p ? p.bar : 'bg-[#7c73e6]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium w-16 text-right ${p ? p.label : 'text-zinc-300'}`}>
                    {u.minutes} min
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal */}
      {selected && (
        <div
          className={`${isClosing ? 'animate-overlay-out' : 'animate-overlay-in'} fixed inset-0 bg-black/60 flex items-center justify-center z-50`}
          onClick={closeModal}
        >
          <div
            className={`${isClosing ? 'animate-scale-out' : 'animate-scale-in'} bg-[#1c1c1f] border border-zinc-800 rounded-2xl p-6 w-72 relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X size={16} />
            </button>

            {(() => {
              const idx = users.indexOf(selected)
              const p = podium[idx]
              return (
                <div className="flex flex-col items-center text-center">
                  {p && (
                    <div className="text-3xl mb-2">{p.rank}</div>
                  )}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mb-3 ${avatarColors[idx % avatarColors.length]} ${p ? p.ring : ''}`}>
                    {initials(selected.name, selected.phone)}
                  </div>
                  <p className="text-white font-semibold text-base">{selected.name ?? 'Unknown'}</p>
                  <p className="text-zinc-400 text-sm mt-0.5">{selected.phone}</p>

                  <div className="mt-5 w-full bg-[#27272a] rounded-2xl p-4 border border-zinc-800 text-center">
                    <p className={`text-2xl font-bold leading-none ${p ? p.label : 'text-white'}`}>{selected.minutes}</p>
                    <p className="text-zinc-500 text-xs mt-1">minutes talked</p>
                  </div>

                  <div className="mt-3 w-full">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                      <span>vs top user</span>
                      <span>{Math.round((selected.minutes / maxMinutes) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${p ? p.bar : 'bg-[#7c73e6]'}`}
                        style={{ width: `${Math.round((selected.minutes / maxMinutes) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
