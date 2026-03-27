import { getServiceBaseUrl, requestJson } from '@/lib/api-base';
import { normalizeReminderRecord, normalizeReminderRecords } from '@/lib/api-transforms';
import type { CreateReminderPayload, ReminderRecord, UpdateReminderPayload } from '@/types/reminder';

const REMINDERS_API_PORT = 3004;

export const remindersApiBaseUrl = getServiceBaseUrl(REMINDERS_API_PORT);

export async function listReminders() {
  console.log('[reminders-api] listReminders:start');
  const response = await requestJson<unknown>(remindersApiBaseUrl, '/reminders');
  const reminders = normalizeReminderRecords(response);
  console.log('[reminders-api] listReminders:success', { count: reminders.length, reminders });
  return reminders;
}

export async function getReminder(reminderId: string) {
  console.log('[reminders-api] getReminder:start', { reminderId });
  const response = await requestJson<unknown>(
    remindersApiBaseUrl,
    `/reminders/${encodeURIComponent(reminderId)}`,
  );
  const reminder = normalizeReminderRecord(response);
  if (!reminder) {
    console.log('[reminders-api] getReminder:invalid-payload', { reminderId, response });
    throw new Error('The reminder payload was not valid.');
  }

  console.log('[reminders-api] getReminder:success', { reminder });
  return reminder;
}

export async function createReminder(payload: CreateReminderPayload) {
  console.log('[reminders-api] createReminder:start', { payload });
  const response = await requestJson<unknown>(remindersApiBaseUrl, '/reminders', {
    body: JSON.stringify(payload),
    method: 'POST',
  });
  const reminder = normalizeReminderRecord(response);
  if (!reminder) {
    console.log('[reminders-api] createReminder:invalid-payload', { payload, response });
    throw new Error('The created reminder payload was not valid.');
  }

  console.log('[reminders-api] createReminder:success', { reminder });
  return reminder;
}

export async function updateReminder(reminderId: string, payload: UpdateReminderPayload) {
  console.log('[reminders-api] updateReminder:start', { payload, reminderId });
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
    console.log('[reminders-api] updateReminder:invalid-payload', { payload, reminderId, response });
    throw new Error('The updated reminder payload was not valid.');
  }

  console.log('[reminders-api] updateReminder:success', { reminder });
  return reminder;
}

export async function deleteReminder(reminderId: string) {
  console.log('[reminders-api] deleteReminder:start', { reminderId });
  return requestJson<{ deletedCount: number }>(
    remindersApiBaseUrl,
    `/reminders/${encodeURIComponent(reminderId)}`,
    { method: 'DELETE' },
  );
}
