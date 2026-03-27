import { apiFetch } from '@/lib/apiClient'
import type { AiPerformanceMetrics, BusinessMetrics, UsageMetrics } from '@/types/metrics'

export async function getUsageMetrics(): Promise<UsageMetrics> {
  return apiFetch<UsageMetrics>('/metrics/usage')
}

export async function getAiPerformanceMetrics(): Promise<AiPerformanceMetrics> {
  return apiFetch<AiPerformanceMetrics>('/metrics/ai-performance')
}

export async function getBusinessMetrics(): Promise<BusinessMetrics> {
  return apiFetch<BusinessMetrics>('/metrics/business')
}
