'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, Calculator } from 'lucide-react'

const navItems = [
  { icon: Users, label: 'Users', href: '/users' },
  { icon: Calculator, label: 'Calculator', href: '/calculator' },
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
          {navItems.map((item, i) => {
            const isActive = pathname === item.href
            return (
              <li key={item.label} className="animate-slide-left" style={{ animationDelay: `${i * 60}ms` }}>
                <Link
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[#2e2b5c] text-white shadow-[inset_0_0_0_1px_rgba(124,115,230,0.3)]'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/70 hover:translate-x-0.5'
                  }`}
                >
                  <item.icon
                    size={16}
                    className={`transition-colors duration-200 ${isActive ? 'text-[#7c73e6]' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                  />
                  {item.label}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#7c73e6]" />
                  )}
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
