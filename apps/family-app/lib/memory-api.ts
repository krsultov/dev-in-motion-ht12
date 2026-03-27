import type {
  CreateUserMemoryPayload,
  UpdateUserMemoryPayload,
  UserMemoryRecord,
  UserMemoryRecordId,
} from '@/types/memory';
import { getServiceBaseUrl, requestJson } from '@/lib/api-base';

const MEMORY_DATA_API_PORT = 3002;
const memoryApiBaseUrl = getServiceBaseUrl(MEMORY_DATA_API_PORT);

export async function listUserMemoryRecordIds(phone: string) {
  return requestJson<UserMemoryRecordId[]>(memoryApiBaseUrl, `/userMemory/${encodeURIComponent(phone)}`);
}

export async function getUserMemoryRecord(recordId: string) {
  return requestJson<UserMemoryRecord>(memoryApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`);
}

export async function getCurrentUserMemory(phone: string) {
  const records = await listUserMemoryRecordIds(phone);
  const latestRecord = records[0];

  if (!latestRecord?._id) {
    return null;
  }

  return getUserMemoryRecord(latestRecord._id);
}

export async function createUserMemory(payload: CreateUserMemoryPayload) {
  return requestJson<UserMemoryRecord>(memoryApiBaseUrl, '/userData', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export async function updateUserMemory(recordId: string, payload: UpdateUserMemoryPayload) {
  return requestJson<UserMemoryRecord>(memoryApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  });
}

export { memoryApiBaseUrl };
