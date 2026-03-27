import { Sidebar } from './Sidebar'

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex h-screen bg-[#18181b] overflow-hidden"
      style={{ fontFamily: 'var(--font-inter), Inter, system-ui, sans-serif' }}
    >
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-y-scroll">
        {children}
      </main>
    </div>
  )
}
