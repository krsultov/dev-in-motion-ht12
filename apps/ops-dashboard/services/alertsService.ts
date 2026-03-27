import { apiFetch } from '@/lib/apiClient'
import type { AlertsOverview } from '@/types/alerts'

export async function getAlertsOverview(): Promise<AlertsOverview> {
  return apiFetch<AlertsOverview>('/alerts')
}
