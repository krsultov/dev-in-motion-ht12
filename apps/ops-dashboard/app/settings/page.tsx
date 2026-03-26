'use client'

import { useState } from 'react'
import { PageShell } from '@/components/PageShell'
import { Check, ChevronDown } from 'lucide-react'

type Tab = 'agent' | 'integrations' | 'notifications' | 'team'

const tabs: { key: Tab; label: string }[] = [
  { key: 'agent', label: 'Agent configuration' },
  { key: 'integrations', label: 'Integrations' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'team', label: 'Team' },
]

const teamMembers = [
  { initials: 'TK', name: 'Teodor K.', email: 'teodor@a1.bg', role: 'Admin', lastActive: 'Today, 11:47 AM' },
  { initials: 'SV', name: 'Silviya V.', email: 'silviya@a1.bg', role: 'Viewer', lastActive: 'Today, 9:30 AM' },
  { initials: 'MP', name: 'Martin P.', email: 'martin@a1.bg', role: 'Editor', lastActive: 'Yesterday, 4:15 PM' },
  { initials: 'BI', name: 'Boryana I.', email: 'boryana@a1.bg', role: 'Viewer', lastActive: '2 days ago' },
  { initials: 'AK', name: 'Aleksander K.', email: 'aleksander@a1.bg', role: 'Admin', lastActive: '3 days ago' },
]

const roleStyles: Record<string, string> = {
  Admin: 'text-[#7c73e6] border-[#7c73e6]/40 bg-[#7c73e6]/10',
  Editor: 'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  Viewer: 'text-zinc-400 border-zinc-700 bg-zinc-800/50',
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative rounded-full transition-colors flex-shrink-0 ${enabled ? 'bg-[#7c73e6]' : 'bg-zinc-600'}`}
      style={{ height: 22, width: 40 }}
    >
      <span
        className="absolute w-4 h-4 rounded-full bg-white shadow transition-all"
        style={{ top: 3, left: enabled ? 22 : 2 }}
      />
    </button>
  )
}

function SelectField({ value, options }: { value: string; options: string[] }) {
  return (
    <div className="relative">
      <select
        defaultValue={value}
        className="appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white pr-8 outline-none focus:border-[#7c73e6] transition-colors w-full cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('agent')
  const [agentToggles, setAgentToggles] = useState({ retryOnFailure: true, callRecording: false })
  const [notifications, setNotifications] = useState({
    callFailures: true,
    highLatency: true,
    dailyDigest: false,
    newUser: true,
    invoiceReady: true,
    systemDowntime: true,
  })

  return (
    <PageShell>
      <header className="flex items-center justify-between px-7 py-5 border-b border-zinc-800 flex-shrink-0">
        <h1 className="text-white text-xl font-semibold">Settings</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <nav className="w-52 flex-shrink-0 border-r border-zinc-800 px-3 py-4 space-y-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-[#2e2b5c] text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1 overflow-y-auto px-7 py-6 pb-8">
          {activeTab === 'agent' && (
            <div className="max-w-xl space-y-5">
              <div>
                <h2 className="text-white font-semibold text-base mb-1">Agent configuration</h2>
                <p className="text-zinc-500 text-sm">Configure the AI voice agent behaviour for your deployment.</p>
              </div>

              <div className="bg-[#27272a] rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
                <div className="px-5 py-4 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-white text-sm font-medium">Voice model</p>
                    <p className="text-zinc-500 text-xs mt-0.5">The AI model powering call synthesis</p>
                  </div>
                  <div className="w-44 flex-shrink-0">
                    <SelectField value="Nelson v2.1 (BG)" options={['Nelson v2.1 (BG)', 'Nelson v2.0 (BG)', 'Nelson v1.8 (EN)', 'Nelson v1.8 (BG)']} />
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-white text-sm font-medium">Primary language</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Default language for agent responses</p>
                  </div>
                  <div className="w-44 flex-shrink-0">
                    <SelectField value="Bulgarian (BG)" options={['Bulgarian (BG)', 'English (EN)', 'Romanian (RO)', 'Serbian (RS)']} />
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-white text-sm font-medium">Response timeout</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Max wait before marking call as failed</p>
                  </div>
                  <div className="w-44 flex-shrink-0">
                    <SelectField value="8 seconds" options={['4 seconds', '6 seconds', '8 seconds', '10 seconds', '15 seconds']} />
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-white text-sm font-medium">Max call duration</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Hard limit per session</p>
                  </div>
                  <div className="w-44 flex-shrink-0">
                    <SelectField value="15 minutes" options={['5 minutes', '10 minutes', '15 minutes', '20 minutes', '30 minutes']} />
                  </div>
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-white text-sm font-medium">Retry on failure</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Automatically retry dropped calls once</p>
                  </div>
                  <Toggle enabled={agentToggles.retryOnFailure} onChange={(v) => setAgentToggles((p) => ({ ...p, retryOnFailure: v }))} />
                </div>
                <div className="px-5 py-4 flex items-center justify-between gap-8">
                  <div>
                    <p className="text-white text-sm font-medium">Call recording</p>
                    <p className="text-zinc-500 text-xs mt-0.5">Store encrypted audio for review</p>
                  </div>
                  <Toggle enabled={agentToggles.callRecording} onChange={(v) => setAgentToggles((p) => ({ ...p, callRecording: v }))} />
                </div>
              </div>

              <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-5">
                <p className="text-white text-sm font-medium mb-2">Greeting message</p>
                <p className="text-zinc-500 text-xs mb-3">Spoken at the start of every call. Use {`{name}`} to insert the caller's name.</p>
                <textarea
                  defaultValue="Здравейте, обаждате се в А1 България. Как мога да ви помогна?"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white outline-none focus:border-[#7c73e6] transition-colors resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-[#7c73e6] hover:bg-[#6b63d4] text-white text-sm font-medium rounded-lg transition-colors">
                    <Check size={14} />
                    Save changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'integrations' && (
            <div className="max-w-xl space-y-5">
              <div>
                <h2 className="text-white font-semibold text-base mb-1">Integrations</h2>
                <p className="text-zinc-500 text-sm">Connect third-party services to extend agent capabilities.</p>
              </div>

              {[
                { name: 'Google Calendar', desc: 'Book and manage appointments during calls', connected: true, icon: '📅' },
                { name: 'Salesforce CRM', desc: 'Look up and update customer records in real time', connected: true, icon: '☁️' },
                { name: 'Stripe Billing', desc: 'Process payments and confirm subscription status', connected: false, icon: '💳' },
                { name: 'Twilio Voice', desc: 'Route calls via Twilio SIP trunking', connected: true, icon: '📞' },
                { name: 'Slack', desc: 'Send alert notifications to a Slack channel', connected: false, icon: '💬' },
                { name: 'Zapier', desc: 'Trigger automations on call events', connected: false, icon: '⚡' },
              ].map((integration) => (
                <div key={integration.name} className="bg-[#27272a] rounded-2xl border border-zinc-800 px-5 py-4 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl leading-none">{integration.icon}</span>
                    <div>
                      <p className="text-white text-sm font-medium">{integration.name}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{integration.desc}</p>
                    </div>
                  </div>
                  <button
                    className={`px-4 py-1.5 text-sm font-medium rounded-lg border transition-colors flex-shrink-0 ${
                      integration.connected
                        ? 'text-zinc-400 border-zinc-700 hover:text-white hover:border-zinc-600'
                        : 'text-[#7c73e6] border-[#7c73e6]/50 hover:bg-[#7c73e6]/10'
                    }`}
                  >
                    {integration.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-xl space-y-5">
              <div>
                <h2 className="text-white font-semibold text-base mb-1">Notifications</h2>
                <p className="text-zinc-500 text-sm">Choose which events trigger email alerts to admins.</p>
              </div>

              <div className="bg-[#27272a] rounded-2xl border border-zinc-800 divide-y divide-zinc-800">
                {[
                  { key: 'callFailures' as const, label: 'Call failures', desc: 'Alert when ≥5 calls fail within 30 minutes' },
                  { key: 'highLatency' as const, label: 'High latency', desc: 'Alert when avg response time exceeds baseline by 2s' },
                  { key: 'dailyDigest' as const, label: 'Daily digest', desc: 'Summary email every morning at 8:00 AM' },
                  { key: 'newUser' as const, label: 'New user registered', desc: 'Notify when a new user completes onboarding' },
                  { key: 'invoiceReady' as const, label: 'Invoice ready', desc: 'Notify when a new invoice is generated' },
                  { key: 'systemDowntime' as const, label: 'System downtime', desc: 'Alert if any node goes offline' },
                ].map((item) => (
                  <div key={item.key} className="px-5 py-4 flex items-center justify-between gap-8">
                    <div>
                      <p className="te  xt-white text-sm font-medium">{item.label}</p>
                      <p className="text-zinc-500 text-xs mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      enabled={notifications[item.key]}
                      onChange={(v) => setNotifications((prev) => ({ ...prev, [item.key]: v }))}
                    />
                  </div>
                ))}
              </div>

              <div className="bg-[#27272a] rounded-2xl border border-zinc-800 px-5 py-4">
                <p className="text-white text-sm font-medium mb-1">Alert email address</p>
                <p className="text-zinc-500 text-xs mb-3">All notifications are sent to this address</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    defaultValue="ops-alerts@a1.bg"
                    className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c73e6] transition-colors"
                  />
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-[#7c73e6] hover:bg-[#6b63d4] text-white text-sm font-medium rounded-lg transition-colors">
                    <Check size={14} />
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="max-w-2xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-white font-semibold text-base mb-1">Team</h2>
                  <p className="text-zinc-500 text-sm">{teamMembers.length} members with console access</p>
                </div>
                <button className="px-4 py-2 bg-[#7c73e6] hover:bg-[#6b63d4] text-white text-sm font-medium rounded-lg transition-colors">
                  Invite member
                </button>
              </div>

              <div className="bg-[#27272a] rounded-2xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 text-left border-b border-zinc-800">
                      <th className="px-5 py-3 font-medium">Member</th>
                      <th className="px-5 py-3 font-medium">Role</th>
                      <th className="px-5 py-3 font-medium">Last active</th>
                      <th className="px-5 py-3 font-medium"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamMembers.map((member) => (
                      <tr key={member.email} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#2e2b5c] flex items-center justify-center text-xs font-bold text-[#7c73e6] flex-shrink-0">
                              {member.initials}
                            </div>
                            <div>
                              <div className="text-white font-medium">{member.name}</div>
                              <div className="text-zinc-500 text-xs mt-0.5">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleStyles[member.role]}`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-zinc-500 text-xs">{member.lastActive}</td>
                        <td className="px-5 py-3 text-right">
                          <button className="text-zinc-500 hover:text-white text-xs transition-colors">
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  )
}