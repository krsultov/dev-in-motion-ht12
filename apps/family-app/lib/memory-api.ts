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
  console.log('[memory-api] listUserMemoryRecordIds:start', { phone });
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/userMemory/${encodeURIComponent(phone)}`);
  const normalized = normalizeUserMemoryRecordIds(response);
  console.log('[memory-api] listUserMemoryRecordIds:success', {
    count: normalized.length,
    phone,
    records: normalized,
  });
  return normalized;
}

export async function getUserMemoryRecord(recordId: string) {
  console.log('[memory-api] getUserMemoryRecord:start', { recordId });
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`);
  const record = normalizeUserMemoryRecord(response);

  if (!record) {
    console.log('[memory-api] getUserMemoryRecord:invalid-payload', { recordId, response });
    throw new Error('The user memory record payload was not valid.');
  }

  console.log('[memory-api] getUserMemoryRecord:success', { recordId, record });
  return record;
}

export async function listUserMemoryRecords() {
  console.log('[memory-api] listUserMemoryRecords:start');
  const response = await requestJson<unknown>(memoryApiBaseUrl, '/userData');
  const records = normalizeUserMemoryRecords(response);
  console.log('[memory-api] listUserMemoryRecords:success', { count: records.length, records });
  return records;
}

export async function getCurrentUserMemory(phone: string) {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    console.log('[memory-api] getCurrentUserMemory:missing-phone');
    return null;
  }

  console.log('[memory-api] getCurrentUserMemory:start', { phone: normalizedPhone });
  const records = await listUserMemoryRecords();
  const latestRecord = records
    .filter((record) => record.phone?.trim() === normalizedPhone)
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0];

  console.log('[memory-api] getCurrentUserMemory:resolved', {
    matchedCount: records.filter((record) => record.phone?.trim() === normalizedPhone).length,
    phone: normalizedPhone,
    record: latestRecord ?? null,
  });
  return latestRecord ?? null;
}

export async function getLatestUserMemoryRecord() {
  console.log('[memory-api] getLatestUserMemoryRecord:start');
  const records = await listUserMemoryRecords();
  const latestRecord = [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0] ?? null;

  console.log('[memory-api] getLatestUserMemoryRecord:resolved', { record: latestRecord });
  return latestRecord;
}

export async function createUserMemory(payload: CreateUserMemoryPayload) {
  console.log('[memory-api] createUserMemory:start', { payload });
  const response = await requestJson<unknown>(memoryApiBaseUrl, '/userData', {
    body: JSON.stringify(payload),
    method: 'POST',
  });

  const record = normalizeUserMemoryRecord(response);
  if (!record) {
    console.log('[memory-api] createUserMemory:invalid-payload', { payload, response });
    throw new Error('The created user memory record payload was not valid.');
  }

  console.log('[memory-api] createUserMemory:success', { record });
  return record;
}

export async function updateUserMemory(recordId: string, payload: UpdateUserMemoryPayload) {
  console.log('[memory-api] updateUserMemory:start', { payload, recordId });
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  });

  const record = normalizeUserMemoryRecord(response);
  if (!record) {
    console.log('[memory-api] updateUserMemory:invalid-payload', { payload, recordId, response });
    throw new Error('The updated user memory record payload was not valid.');
  }

  console.log('[memory-api] updateUserMemory:success', { record });
  return record;
}

export { memoryApiBaseUrl };
