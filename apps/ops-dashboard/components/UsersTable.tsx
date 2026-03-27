'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import type { UserRecord } from '@/app/users/page'
import { getPlan } from '@/app/users/page'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function initials(name?: string, phone?: string) {
  if (name) {
    return name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  }
  return phone?.slice(-2) ?? '??'
}

const avatarColors = [
  'bg-[#2e2b5c] text-[#7c73e6]',
  'bg-[#1e3a5f] text-blue-300',
  'bg-[#1a3a2a] text-[#4ade80]',
  'bg-[#3a2a1a] text-[#fbbf24]',
  'bg-[#3a1a1a] text-[#f87171]',
]

export function UsersTable({ users }: { users: UserRecord[] }) {
  const [selected, setSelected] = useState<UserRecord | null>(null)
  const [isClosing, setIsClosing] = useState(false)

  const closeModal = useCallback(() => {
    setIsClosing(true)
    setTimeout(() => {
      setSelected(null)
      setIsClosing(false)
    }, 200)
  }, [])

  return (
    <>
      <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-left border-b border-zinc-800">
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Memories</th>
              <th className="px-5 py-3 font-medium">Contacts</th>
              <th className="px-5 py-3 font-medium">Medications</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => {
              const plan = getPlan(user._id)
              return (
                <tr key={user._id} className="animate-fade-up border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors" style={{ animationDelay: `${i * 40}ms` }}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelected(user)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#7c73e6] transition-all ${avatarColors[i % avatarColors.length]}`}
                      >
                        {initials(user.name, user.phone)}
                      </button>
                      <div>
                        <div className="text-white font-medium">{user.name ?? 'Unknown'}</div>
                        <div className="text-zinc-500 text-xs mt-0.5">{user.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      plan.type === 'subscription'
                        ? 'bg-[#2e2b5c] text-[#7c73e6]'
                        : 'bg-[#1a3a2a] text-[#4ade80]'
                    }`}>
                      {plan.type === 'subscription' ? 'Subscription' : 'Per-minute'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-zinc-300">{user.memories?.length ?? 0}</td>
                  <td className="px-5 py-3 text-zinc-300">{user.contacts?.length ?? 0}</td>
                  <td className="px-5 py-3 text-zinc-300">{user.medications?.length ?? 0}</td>
                  <td className="px-5 py-3 text-zinc-500 text-xs">{formatDate(user.createdAt)}</td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-zinc-500 text-sm">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className={`${isClosing ? 'animate-overlay-out' : 'animate-overlay-in'} fixed inset-0 bg-black/60 flex items-center justify-center z-50`}
          onClick={closeModal}
        >
          <div
            className={`${isClosing ? 'animate-scale-out' : 'animate-scale-in'} bg-[#1c1c1f] border border-zinc-800 rounded-2xl p-6 w-80 relative`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex flex-col items-center text-center mb-5">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold mb-3 ${avatarColors[users.indexOf(selected) % avatarColors.length]}`}>
                {initials(selected.name, selected.phone)}
              </div>
              <p className="text-white font-semibold text-base">{selected.name ?? 'Unknown'}</p>
              <p className="text-zinc-400 text-sm mt-0.5">{selected.phone}</p>
              <span className={`mt-2 text-xs font-medium px-2.5 py-1 rounded-full ${
                getPlan(selected._id).type === 'subscription'
                  ? 'bg-[#2e2b5c] text-[#7c73e6]'
                  : 'bg-[#1a3a2a] text-[#4ade80]'
              }`}>
                {getPlan(selected._id).type === 'subscription' ? 'Subscription — €4.99/mo' : 'Per-minute — €0.15/min'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-5">
              {[
                { label: 'Memories', value: selected.memories?.length ?? 0 },
                { label: 'Contacts', value: selected.contacts?.length ?? 0 },
                { label: 'Medications', value: selected.medications?.length ?? 0 },
                { label: 'Preferences', value: selected.preferences?.length ?? 0 },
              ].map((s, i) => (
                <div key={s.label} className="animate-fade-up bg-[#27272a] rounded-xl p-3 border border-zinc-800 text-center" style={{ animationDelay: `${80 + i * 50}ms` }}>
                  <p className="text-white font-bold text-lg leading-none">{s.value}</p>
                  <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Joined</span>
                <span className="text-zinc-300">{formatDate(selected.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Last updated</span>
                <span className="text-zinc-300">{formatDate(selected.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
