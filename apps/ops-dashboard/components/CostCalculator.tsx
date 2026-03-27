'use client'

import { useState } from 'react'
import { NELSON_COST_PER_MIN, SUBSCRIPTION_PRICE, PER_MINUTE_RATE } from '@/lib/pricing'

function Slider({
  label,
  hint,
  value,
  min,
  max,
  unit,
  disabled,
  onChange,
}: {
  label: string
  hint?: string
  value: number
  min: number
  max: number
  unit: string
  disabled?: boolean
  onChange: (v: number) => void
}) {
  const pct = max === min ? 0 : ((value - min) / (max - min)) * 100
  const fill = disabled ? '#3f3f46' : '#7c73e6'
  const track = `linear-gradient(to right, ${fill} ${pct}%, #3f3f46 ${pct}%)`

  return (
    <div className={`transition-opacity ${disabled ? 'opacity-35 pointer-events-none' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-zinc-200 text-sm font-medium">{label}</p>
          {hint && <p className="text-zinc-600 text-xs mt-0.5">{hint}</p>}
        </div>
        <span className="text-white font-bold text-sm tabular-nums ml-6 flex-shrink-0">
          {value} {unit}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: track }}
        className="
          w-full h-1.5 rounded-full appearance-none outline-none
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:w-[18px]
          [&::-webkit-slider-thumb]:h-[18px]
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-white
          [&::-webkit-slider-thumb]:shadow-[0_0_0_3px_rgba(124,115,230,0.3)]
          [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:transition-transform
          [&:not(:disabled)]:cursor-pointer
          [&:not(:disabled)::-webkit-slider-thumb]:hover:scale-110
        "
      />

      <div className="flex justify-between text-zinc-700 text-xs mt-1.5">
        <span>{min}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string
  value: string
  sub: string
  highlight?: 'green' | 'red' | null
}) {
  const valueColor =
    highlight === 'green' ? 'text-[#4ade80]' :
    highlight === 'red' ? 'text-[#f87171]' :
    'text-white'

  return (
    <div className="bg-[#1c1c1f] rounded-2xl p-5 border border-zinc-800">
      <p className="text-zinc-400 text-sm">{label}</p>
      <p className={`text-3xl font-bold mt-2 leading-none tracking-tight ${valueColor}`}>{value}</p>
      <p className="text-zinc-600 text-xs mt-1.5 leading-snug">{sub}</p>
    </div>
  )
}

export function CostCalculator({
  totalUsers,
  subscriptionUsers: defaultSub,
}: {
  totalUsers: number
  subscriptionUsers: number
  perMinuteUsers: number
}) {
  const [subUsers, setSubUsers] = useState(Math.max(defaultSub, Math.round(totalUsers / 2)))
  const [subMinutes, setSubMinutes] = useState(45)
  const [pmMinutes, setPmMinutes] = useState(30)

  const pmUsers = Math.max(0, totalUsers - subUsers)
  const subPct = totalUsers > 0 ? (subUsers / totalUsers) * 100 : 0

  const subRevenue = subUsers * SUBSCRIPTION_PRICE
  const pmRevenue = pmUsers * pmMinutes * PER_MINUTE_RATE
  const totalRevenue = subRevenue + pmRevenue
  const nelsonCost = (subUsers * subMinutes + pmUsers * pmMinutes) * NELSON_COST_PER_MIN
  const profit = totalRevenue - nelsonCost
  const margin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="h-full">
        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-6 h-full flex flex-col gap-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">User split</p>
              <span className="text-zinc-500 text-sm">{totalUsers} total</span>
            </div>

            <div className="flex rounded-lg overflow-hidden h-8 mb-3 text-xs font-semibold">
              {subUsers > 0 && (
                <div
                  className="flex items-center justify-center bg-[#2e2b5c] text-[#7c73e6] transition-all"
                  style={{ width: `${subPct}%` }}
                >
                  {subUsers > 1 || subPct > 20 ? `${subUsers} subs` : ''}
                </div>
              )}
              {pmUsers > 0 && (
                <div
                  className="flex items-center justify-center bg-[#1a3a2a] text-[#4ade80] transition-all flex-1"
                >
                  {pmUsers > 1 || subPct < 80 ? `${pmUsers} p/m` : ''}
                </div>
              )}
            </div>

            <Slider
              label="Subscription users"
              value={subUsers}
              min={0}
              max={totalUsers}
              unit="users"
              onChange={setSubUsers}
            />
          </div>

          <div className="h-px bg-zinc-800" />

          <div className="flex-1 flex flex-col justify-between gap-6">
            <Slider
              label="Subscription — avg minutes/month"
              hint={subUsers === 0 ? 'No subscription users' : 'Affects Nelson cost only — flat fee regardless of usage'}
              value={subMinutes}
              min={5}
              max={1000}
              unit="min"
              disabled={subUsers === 0}
              onChange={setSubMinutes}
            />

            <Slider
              label="Per-minute — avg minutes/month"
              hint={pmUsers === 0 ? 'No per-minute users' : 'Affects both revenue and Nelson cost'}
              value={pmMinutes}
              min={5}
              max={1000}
              unit="min"
              disabled={pmUsers === 0}
              onChange={setPmMinutes}
            />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            label="Nelson cost"
            value={`€${nelsonCost.toFixed(2)}`}
            sub="€0.10 × all minutes used"
          />
          <StatCard
            label="Total revenue"
            value={`€${totalRevenue.toFixed(2)}`}
            sub="subscriptions + per-minute"
          />
          <StatCard
            label="Profit"
            value={`€${profit.toFixed(2)}`}
            sub="revenue − cost"
            highlight={profit >= 0 ? 'green' : 'red'}
          />
          <StatCard
            label="Margin"
            value={`${margin.toFixed(1)}%`}
            sub="profit / revenue"
            highlight={margin >= 0 ? 'green' : 'red'}
          />
        </div>

        <div className="bg-[#27272a] rounded-2xl border border-zinc-800 p-5 space-y-3">
          <p className="text-white font-semibold text-sm">Breakdown</p>
          <div className="space-y-2.5 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-zinc-500">{subUsers} subscription × €{SUBSCRIPTION_PRICE}/mo</span>
              <span className="text-white font-medium flex-shrink-0">€{subRevenue.toFixed(2)}</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <span className="text-zinc-500">{pmUsers} per-minute × {pmMinutes} min × €{PER_MINUTE_RATE}/min</span>
              <span className="text-white font-medium flex-shrink-0">€{pmRevenue.toFixed(2)}</span>
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="flex items-start justify-between gap-4">
              <span className="text-zinc-500">
                Nelson — ({subUsers} × {subMinutes} min) + ({pmUsers} × {pmMinutes} min) × €0.10
              </span>
              <span className="text-[#f87171] font-medium flex-shrink-0">−€{nelsonCost.toFixed(2)}</span>
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Net profit</span>
              <span className={`font-bold ${profit >= 0 ? 'text-[#4ade80]' : 'text-[#f87171]'}`}>
                €{profit.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
