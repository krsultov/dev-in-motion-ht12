import { getServiceBaseUrl, requestJson } from '@/lib/api-base';
import type { CreateReminderPayload, ReminderRecord, UpdateReminderPayload } from '@/types/reminder';

const REMINDERS_API_PORT = 3004;

export const remindersApiBaseUrl = getServiceBaseUrl(REMINDERS_API_PORT);

export async function listReminders() {
  return requestJson<ReminderRecord[]>(remindersApiBaseUrl, '/reminders');
}

export async function getReminder(reminderId: string) {
  return requestJson<ReminderRecord>(remindersApiBaseUrl, `/reminders/${encodeURIComponent(reminderId)}`);
}

export async function createReminder(payload: CreateReminderPayload) {
  return requestJson<ReminderRecord>(remindersApiBaseUrl, '/reminders', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
}

export async function updateReminder(reminderId: string, payload: UpdateReminderPayload) {
  return requestJson<ReminderRecord>(remindersApiBaseUrl, `/reminders/${encodeURIComponent(reminderId)}`, {
    body: JSON.stringify(payload),
    method: 'PUT',
  });
}

export async function deleteReminder(reminderId: string) {
  return requestJson<{ deletedCount: number }>(
    remindersApiBaseUrl,
    `/reminders/${encodeURIComponent(reminderId)}`,
    { method: 'DELETE' },
  );
}
