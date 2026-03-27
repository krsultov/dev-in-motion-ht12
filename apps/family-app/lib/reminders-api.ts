import { getServiceBaseUrl, requestJson } from '@/lib/api-base';
import { normalizeReminderRecord, normalizeReminderRecords } from '@/lib/api-transforms';
import type { CreateReminderPayload, ReminderRecord, UpdateReminderPayload } from '@/types/reminder';

const REMINDERS_API_PORT = 3004;

export const remindersApiBaseUrl = getServiceBaseUrl(REMINDERS_API_PORT);

export async function listReminders() {
  const response = await requestJson<unknown>(remindersApiBaseUrl, '/reminders');
  return normalizeReminderRecords(response);
}

export async function getReminder(reminderId: string) {
  const response = await requestJson<unknown>(
    remindersApiBaseUrl,
    `/reminders/${encodeURIComponent(reminderId)}`,
  );
  const reminder = normalizeReminderRecord(response);
  if (!reminder) {
    throw new Error('The reminder payload was not valid.');
  }

  return reminder;
}

export async function createReminder(payload: CreateReminderPayload) {
  const response = await requestJson<unknown>(remindersApiBaseUrl, '/reminders', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
  const reminder = normalizeReminderRecord(response);
  if (!reminder) {
    throw new Error('The created reminder payload was not valid.');
  }

  return reminder;
}

export async function updateReminder(reminderId: string, payload: UpdateReminderPayload) {
  const response = await requestJson<unknown>(
    remindersApiBaseUrl,
    `/reminders/${encodeURIComponent(reminderId)}`,
    {
    body: JSON.stringify(payload),
    method: 'PUT',
    },
  );
  const reminder = normalizeReminderRecord(response);
  if (!reminder) {
    throw new Error('The updated reminder payload was not valid.');
  }

  return reminder;
}

export async function deleteReminder(reminderId: string) {
  return requestJson<{ deletedCount: number }>(
    remindersApiBaseUrl,
    `/reminders/${encodeURIComponent(reminderId)}`,
    { method: 'DELETE' },
  );
}
