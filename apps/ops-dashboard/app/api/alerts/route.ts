import { NextResponse } from 'next/server'
import { getAlertsOverview } from '@/services/alertsService'

export async function GET() {
  try {
    const data = await getAlertsOverview()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch alerts overview' }, { status: 500 })
  }
}
