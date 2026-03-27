import type { CalendarActivity } from '@/types/ui-models';
import type { UserMemoryRecord } from '@/types/memory';
import type { ReminderRecord } from '@/types/reminder';

export type HomeSummaryActivity = {
  id: string;
  title: string;
  description: string;
};

export type LiveElderProfile = {
  initials: string;
  name: string;
  phone: string;
  lastUpdatedLabel: string;
  aiActive: boolean;
};

function formatDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatTimeLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function formatRelativeLabel(value: string) {
  const time = new Date(value).getTime();
  if (Number.isNaN(time)) {
    return 'Unknown';
  }

  const diffMs = Date.now() - time;
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
}

function toInitials(name?: string) {
  if (!name) {
    return 'FA';
  }

  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('') || 'FA';
}

function classifyReminderType(reminder: ReminderRecord): CalendarActivity['type'] {
  const haystack = `${reminder.title} ${reminder.description ?? ''}`.toLowerCase();

  if (haystack.includes('ride') || haystack.includes('trip') || haystack.includes('taxi')) {
    return 'trip';
  }

  if (haystack.includes('ai') || haystack.includes('assistant')) {
    return 'assistant';
  }

  return 'booking';
}

export function buildElderProfile(memoryRecord: UserMemoryRecord | null, phone: string | null): LiveElderProfile {
  return {
    aiActive: true,
    initials: toInitials(memoryRecord?.name),
    lastUpdatedLabel: memoryRecord?.updatedAt ? formatRelativeLabel(memoryRecord.updatedAt) : 'No updates yet',
    name: memoryRecord?.name ?? 'Family member',
    phone: memoryRecord?.phone ?? phone ?? 'No phone linked',
  };
}

export function buildCalendarActivities(reminders: ReminderRecord[]): CalendarActivity[] {
  return reminders
    .map((reminder) => {
      const endTime = new Date(reminder.endTime);
      const isValid = !Number.isNaN(endTime.getTime());
      const now = Date.now();

      return {
        id: reminder._id,
        date: isValid ? formatDateKey(endTime) : formatDateKey(new Date()),
        detail: isValid ? formatTimeLabel(endTime) : 'Time unavailable',
        isFuture: isValid ? endTime.getTime() > now : false,
        title: reminder.title,
        type: classifyReminderType(reminder),
      } satisfies CalendarActivity;
    })
    .sort((left, right) => `${left.date} ${left.detail}`.localeCompare(`${right.date} ${right.detail}`));
}

export function buildRecentActivity(reminders: ReminderRecord[]): HomeSummaryActivity[] {
  return [...reminders]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 2)
    .map((reminder) => ({
      description: reminder.description?.trim() || `Scheduled for ${new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(new Date(reminder.endTime))}`,
      id: reminder._id,
      title: reminder.title,
    }));
}
