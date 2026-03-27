import type {
  CreateUserMemoryPayload,
  UpdateUserMemoryPayload,
  UserMemoryRecord,
  UserMemoryRecordId,
} from '@/types/memory';
import { getServiceBaseUrl, requestJson } from '@/lib/api-base';
import {
  normalizeUserMemoryRecord,
  normalizeUserMemoryRecordIds,
  normalizeUserMemoryRecords,
} from '@/lib/api-transforms';

const MEMORY_DATA_API_PORT = 3002;
const memoryApiBaseUrl = getServiceBaseUrl(MEMORY_DATA_API_PORT);

export async function listUserMemoryRecordIds(phone: string) {
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/userMemory/${encodeURIComponent(phone)}`);
  return normalizeUserMemoryRecordIds(response);
}

export async function getUserMemoryRecord(recordId: string) {
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`);
  const record = normalizeUserMemoryRecord(response);

  if (!record) {
    throw new Error('The user memory record payload was not valid.');
  }

  return record;
}

export async function listUserMemoryRecords() {
  const response = await requestJson<unknown>(memoryApiBaseUrl, '/userData');
  return normalizeUserMemoryRecords(response);
}

export async function getCurrentUserMemory(phone: string) {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    return null;
  }

  const records = await listUserMemoryRecords();
  const latestRecord = records
    .filter((record) => record.phone?.trim() === normalizedPhone)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0];

  return latestRecord ?? null;
}

export async function getLatestUserMemoryRecord() {
  const records = await listUserMemoryRecords();
  return [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0] ?? null;
}

export async function createUserMemory(payload: CreateUserMemoryPayload) {
  const response = await requestJson<unknown>(memoryApiBaseUrl, '/userData', {
    body: JSON.stringify(payload),
    method: 'POST',
  });

  const record = normalizeUserMemoryRecord(response);
  if (!record) {
    throw new Error('The created user memory record payload was not valid.');
  }

  return record;
}

export async function updateUserMemory(recordId: string, payload: UpdateUserMemoryPayload) {
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  });

  const record = normalizeUserMemoryRecord(response);
  if (!record) {
    throw new Error('The updated user memory record payload was not valid.');
  }

  return record;
}

export { memoryApiBaseUrl };
