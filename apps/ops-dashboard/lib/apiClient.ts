import { getApiBaseUrl } from '@/lib/env'

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl()

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}
