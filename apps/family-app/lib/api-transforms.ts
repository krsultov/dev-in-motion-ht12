import type {
  MemoryContact,
  MemoryMedication,
  MemoryPreference,
  UserMemoryRecord,
  UserMemoryRecordId,
} from '@/types/memory';
import type { ReminderRecord } from '@/types/reminder';

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function asString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function asOptionalString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function makeFallbackId(prefix: string, index: number, ...parts: Array<string | undefined>) {
  const normalizedParts = parts
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim().toLowerCase().replace(/\s+/g, '-'));

  return normalizedParts.length > 0 ? `${prefix}-${normalizedParts.join('-')}` : `${prefix}-${index + 1}`;
}

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => asString(item).trim())
    .filter(Boolean);
}

function normalizeContacts(value: unknown): MemoryContact[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<MemoryContact[]>((items, entry, index) => {
    const record = asRecord(entry);
    if (!record) {
      return items;
    }

    const name = asString(record.name).trim();
    const role = asString(record.role).trim();
    const phone = asString(record.phone).trim();

    if (!name && !role && !phone) {
      return items;
    }

    items.push({
      id: asOptionalString(record.id) ?? makeFallbackId('contact', index, name, phone),
      name: name || 'Unnamed contact',
      phone: phone || 'No phone listed',
      role: role || 'No role listed',
    });

    return items;
  }, []);
}

function normalizePreferences(value: unknown): MemoryPreference[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<MemoryPreference[]>((items, entry, index) => {
    const record = asRecord(entry);
    if (!record) {
      return items;
    }

    const label = asString(record.label).trim();
    const preferenceValue = asString(record.value).trim();

    if (!label && !preferenceValue) {
      return items;
    }

    items.push({
      id: asOptionalString(record.id) ?? makeFallbackId('preference', index, label, preferenceValue),
      label: label || 'Preference',
      value: preferenceValue || 'No value provided',
    });

    return items;
  }, []);
}

function normalizeMedications(value: unknown): MemoryMedication[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<MemoryMedication[]>((items, entry, index) => {
    const record = asRecord(entry);
    if (!record) {
      return items;
    }

    const name = asString(record.name).trim();
    const schedule = asString(record.schedule).trim();

    if (!name && !schedule) {
      return items;
    }

    items.push({
      id: asOptionalString(record.id) ?? makeFallbackId('medication', index, name, schedule),
      name: name || 'Medication',
      schedule: schedule || 'No schedule provided',
    });

    return items;
  }, []);
}

export function normalizeUserMemoryRecord(value: unknown): UserMemoryRecord | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const recordId = asString(record._id).trim();
  if (!recordId) {
    return null;
  }

  return {
    _id: recordId,
    contacts: normalizeContacts(record.contacts),
    createdAt: asString(record.createdAt),
    medications: normalizeMedications(record.medications),
    memories: normalizeStringArray(record.memories),
    name: asOptionalString(record.name),
    password: asOptionalString(record.password),
    phone: asOptionalString(record.phone),
    preferences: normalizePreferences(record.preferences),
    updatedAt: asString(record.updatedAt),
  };
}

export function normalizeUserMemoryRecords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeUserMemoryRecord(item))
    .filter((item): item is UserMemoryRecord => item !== null);
}

export function normalizeUserMemoryRecordIds(value: unknown): UserMemoryRecordId[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<UserMemoryRecordId[]>((items, entry) => {
    const record = asRecord(entry);
    const recordId = record ? asString(record._id).trim() : '';
    if (recordId) {
      items.push({ _id: recordId });
    }
    return items;
  }, []);
}

export function normalizeReminderRecord(value: unknown): ReminderRecord | null {
  const record = asRecord(value);
  if (!record) {
    return null;
  }

  const reminderId = asString(record._id).trim();
  const title = asString(record.title).trim();

  if (!reminderId || !title) {
    return null;
  }

  return {
    _id: reminderId,
    createdAt: asString(record.createdAt),
    cron: asOptionalString(record.cron),
    description: asOptionalString(record.description),
    endTime: asString(record.endTime),
    title,
    updatedAt: asString(record.updatedAt),
  };
}

export function normalizeReminderRecords(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeReminderRecord(item))
    .filter((item): item is ReminderRecord => item !== null);
}
