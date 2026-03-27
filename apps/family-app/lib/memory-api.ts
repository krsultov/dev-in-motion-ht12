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

const MEMORY_API_PORT = 3001;
const USERDATA_API_PORT = 3002;

const memoryApiBaseUrl = getServiceBaseUrl(MEMORY_API_PORT);
const userdataApiBaseUrl = getServiceBaseUrl(USERDATA_API_PORT);

type MemoryEntry = {
  id: string;
  userId: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

type CallMinutesByUserResponse = Record<string, number>;

export type RecentCallItem = {
  id: string;
  startedAt: string;
  durationSec: number | null;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function toTitleCase(input: string) {
  return input
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatMemoryEntry(entry: MemoryEntry) {
  const normalizedValue = entry.value.trim();
  if (!normalizedValue) {
    return '';
  }

  const normalizedKey = entry.key.trim().replace(/[_-]+/g, ' ');
  if (!normalizedKey) {
    return normalizedValue;
  }

  return `${toTitleCase(normalizedKey)}: ${normalizedValue}`;
}

function normalizeMemoryEntries(value: unknown): MemoryEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<MemoryEntry[]>((items, entry) => {
    const record = asRecord(entry);
    if (!record) {
      return items;
    }

    const id = asString(record.id).trim();
    const userId = asString(record.userId).trim();
    const key = asString(record.key).trim();
    const formattedValue = asString(record.value);

    if (!id || !userId || !key || !formattedValue.trim()) {
      return items;
    }

    items.push({
      id,
      userId,
      key,
      value: formattedValue,
      createdAt: asString(record.createdAt),
      updatedAt: asString(record.updatedAt),
    });

    return items;
  }, []);
}

function mergeMemoryNotes(record: UserMemoryRecord | null, memoryEntries: MemoryEntry[], phone: string) {
  const persistedMemories = record?.memories ?? [];
  const liveMemories = memoryEntries.map(formatMemoryEntry).filter(Boolean);
  const mergedMemories = [...persistedMemories, ...liveMemories].filter(Boolean);
  const dedupedMemories = [...new Set(mergedMemories)];

  if (!record) {
    if (dedupedMemories.length === 0) {
      return null;
    }

    const latestUpdatedAt = [...memoryEntries]
      .map((entry) => entry.updatedAt)
      .filter((value) => value.trim().length > 0)
      .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0] ?? '';

    return {
      _id: `memory-only:${phone}`,
      contacts: [],
      createdAt: latestUpdatedAt,
      medications: [],
      memories: dedupedMemories,
      phone,
      preferences: [],
      updatedAt: latestUpdatedAt,
    } satisfies UserMemoryRecord;
  }

  return {
    ...record,
    memories: dedupedMemories,
  };
}

async function listMemoryEntries(phone: string) {
  const response = await requestJson<unknown>(memoryApiBaseUrl, `/memories?userId=${encodeURIComponent(phone)}`);
  return normalizeMemoryEntries(response);
}

export async function listUserMemoryRecordIds(phone: string) {
  const response = await requestJson<unknown>(userdataApiBaseUrl, `/userMemory/${encodeURIComponent(phone)}`);
  return normalizeUserMemoryRecordIds(response);
}

export async function getUserMemoryRecord(recordId: string) {
  const response = await requestJson<unknown>(userdataApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`);
  const record = normalizeUserMemoryRecord(response);

  if (!record) {
    throw new Error('The user memory record payload was not valid.');
  }

  return record;
}

export async function listUserMemoryRecords() {
  const response = await requestJson<unknown>(userdataApiBaseUrl, '/userData');
  return normalizeUserMemoryRecords(response);
}

export async function getCurrentUserMemory(phone: string) {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    return null;
  }

  const [recordIds, memoryEntries] = await Promise.all([
    listUserMemoryRecordIds(normalizedPhone),
    listMemoryEntries(normalizedPhone).catch(() => []),
  ]);

  const records = await Promise.all(
    recordIds.map(async ({ _id }) => {
      try {
        return await getUserMemoryRecord(_id);
      } catch {
        return null;
      }
    }),
  );

  const latestRecord =
    records
      .filter((record): record is UserMemoryRecord => record !== null)
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())[0] ?? null;

  return mergeMemoryNotes(latestRecord, memoryEntries, normalizedPhone);
}

export async function getLatestUserMemoryRecord() {
  const records = await listUserMemoryRecords();
  return [...records].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  )[0] ?? null;
}

export async function getUserTotalCallMinutes(phone: string) {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    return 0;
  }

  const response = await requestJson<unknown>(memoryApiBaseUrl, '/stats/call-minutes-by-user');
  const minutesByUser = asRecord(response) as CallMinutesByUserResponse | null;

  if (!minutesByUser) {
    throw new Error('The call minutes payload was not valid.');
  }

  const minutes = minutesByUser[normalizedPhone];
  return typeof minutes === 'number' && Number.isFinite(minutes) ? minutes : 0;
}

export async function listRecentCalls(phone: string, limit = 3) {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) {
    return [];
  }

  const response = await requestJson<unknown>(
    memoryApiBaseUrl,
    `/calls?userId=${encodeURIComponent(normalizedPhone)}&limit=${encodeURIComponent(String(limit))}`,
  );
  const payload = asRecord(response);
  const calls = payload?.calls;

  if (!Array.isArray(calls)) {
    throw new Error('The recent calls payload was not valid.');
  }

  return calls.reduce<RecentCallItem[]>((items, entry) => {
    const record = asRecord(entry);
    if (!record) {
      return items;
    }

    const id = asString(record.id).trim();
    const startedAt = asString(record.startedAt).trim();

    if (!id || !startedAt) {
      return items;
    }

    items.push({
      id,
      startedAt,
      durationSec: asNumber(record.durationSec),
    });

    return items;
  }, []);
}

export async function createUserMemory(payload: CreateUserMemoryPayload) {
  const response = await requestJson<unknown>(userdataApiBaseUrl, '/userData', {
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
  const response = await requestJson<unknown>(userdataApiBaseUrl, `/userData/${encodeURIComponent(recordId)}`, {
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
