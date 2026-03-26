import { NextResponse } from 'next/server'
import { getUsageMetrics } from '@/services/metricsService'

export async function GET() {
  try {
    const data = await getUsageMetrics()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch usage metrics' }, { status: 500 })
  }
}
