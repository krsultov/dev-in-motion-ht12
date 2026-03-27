import { NextResponse } from 'next/server'
import { getAiPerformanceMetrics } from '@/services/metricsService'

export async function GET() {
  try {
    const data = await getAiPerformanceMetrics()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch AI performance metrics' }, { status: 500 })
  }
}
