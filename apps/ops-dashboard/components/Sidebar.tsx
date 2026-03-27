'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Brain, Bell } from 'lucide-react'

const navItems = [
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Brain, label: 'Memories', href: '/memory' },
  { icon: Bell, label: 'Reminders', href: '/reminders' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-[#1c1c1f] flex flex-col h-screen border-r border-zinc-800">
      <div className="px-5 py-5 flex items-center gap-3 border-b border-zinc-800">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#7c73e6] to-[#5b52c4] flex items-center justify-center text-white font-bold text-base flex-shrink-0">
          N
        </div>
        <div>
          <div className="text-white font-semibold text-sm leading-tight">Nelson</div>
          <div className="text-zinc-500 text-xs leading-tight">Operator console</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#2e2b5c] text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <item.icon size={16} className={isActive ? 'text-[#7c73e6]' : 'text-zinc-500'} />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="px-4 py-4 border-t border-zinc-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1e3a5f] flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
          TK
        </div>
        <div className="min-w-0">
          <div className="text-white text-sm font-medium leading-tight truncate">Teodor K.</div>
          <div className="text-zinc-500 text-xs leading-tight">A1 Bulgaria</div>
        </div>
      </div>
    </aside>
  )
}
