export type SystemStatus = 'healthy' | 'degraded' | 'down'

export interface RecentAlert {
  id: string
  type: string
  message: string
  timestamp: string
}

export interface AlertsOverview {
  failedCalls: number
  unusualActivity: boolean
  systemStatus: SystemStatus
  recentAlerts: RecentAlert[]
}
