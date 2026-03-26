import type { ActivityResponse, Preference } from '@/types/api';

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN_ERROR';

export class ApiError extends Error {
  code: ApiErrorCode;
  statusCode: number;

  constructor(message: string, code: ApiErrorCode = 'UNKNOWN_ERROR', statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const BASE = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

type ErrorResponse = {
  code?: ApiErrorCode;
  message?: string;
};

export async function apiFetch<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
  });

  const text = await response.text();
  const json = text ? (JSON.parse(text) as T | ErrorResponse) : null;

  if (!response.ok) {
    const errorBody = (json ?? {}) as ErrorResponse;

    throw new ApiError(
      errorBody.message ?? 'Request failed',
      errorBody.code ?? 'UNKNOWN_ERROR',
      response.status,
    );
  }

  return json as T;
}

// TODO: wire to edit UI
export async function updateMemoryEntry(
  parentId: string,
  memoryId: string,
  value: string,
  token: string,
): Promise<Preference> {
  return apiFetch<Preference>(`/parent/${parentId}/memory/${memoryId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({ value }),
  });
}

export async function fetchActivity(
  parentId: string,
  token: string,
  cursor?: string,
  limit = 20,
): Promise<ActivityResponse> {
  const params = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    params.set('cursor', cursor);
  }

  return apiFetch<ActivityResponse>(`/parent/${parentId}/activity?${params.toString()}`, token);
}
