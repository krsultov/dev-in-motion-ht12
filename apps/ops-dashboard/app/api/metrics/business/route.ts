import { NextResponse } from 'next/server'
import { getBusinessMetrics } from '@/services/metricsService'

export async function GET() {
  try {
    const data = await getBusinessMetrics()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch business metrics' }, { status: 500 })
  }
}
