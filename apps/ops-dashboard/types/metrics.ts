export interface PeakHour {
  hour: string
  callCount: number
}

export interface UsageMetrics {
  activeElderlyUsers: number
  totalCalls: number
  callsToday: number
  peakHours: PeakHour[]
}

export interface AiPerformanceMetrics {
  callSuccessRate: number
  avgCallDuration: number
  tasksCompleted: number
  failedTasks: number
}

export interface BusinessMetrics {
  activeSubscriptions: number
  churnRate: number
  newSignups: number
  revenueEstimate: number
}
