import type { CalendarActivity } from '@/types/ui-models';
import type { UserMemoryRecord } from '@/types/memory';
import type { ReminderRecord } from '@/types/reminder';

export type HomeSummaryActivity = {
  id: string;
  title: string;
  description: string;
};

export type HomeSnapshotStat = {
  id: string;
  label: string;
  value: string;
};

export type HomeUpcomingReminder = {
  id: string;
  title: string;
  detail: string;
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

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

type ParsedReminderDate = {
  date: Date;
  isClockOnly: boolean;
  parseStrategy: 'datetime' | 'time-only' | 'fallback';
};

function parseTimeParts(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? '0');

  if (hours > 23 || minutes > 59 || seconds > 59) {
    return null;
  }

  return { hours, minutes, seconds };
}

function parseReminderDate(reminder: ReminderRecord): ParsedReminderDate {
  const parsedDateTime = new Date(reminder.endTime);
  if (isValidDate(parsedDateTime)) {
    return {
      date: parsedDateTime,
      isClockOnly: false,
      parseStrategy: 'datetime',
    };
  }

  const timeParts = parseTimeParts(reminder.endTime);
  if (timeParts) {
    const baseDate = new Date();
    baseDate.setHours(timeParts.hours, timeParts.minutes, timeParts.seconds, 0);

    return {
      date: baseDate,
      isClockOnly: true,
      parseStrategy: 'time-only',
    };
  }

  return {
    date: new Date(),
    isClockOnly: false,
    parseStrategy: 'fallback',
  };
}

function getNextReminderOccurrence(reminder: ReminderRecord) {
  const parsed = parseReminderDate(reminder);
  if (parsed.parseStrategy !== 'time-only') {
    return parsed;
  }

  const nextOccurrence = new Date(parsed.date);
  if (nextOccurrence.getTime() < Date.now()) {
    nextOccurrence.setDate(nextOccurrence.getDate() + 1);
  }

  return {
    ...parsed,
    date: nextOccurrence,
  };
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

function formatCalendarLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(value);
}

function formatReminderDetail(value: Date) {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const dateKey = formatDateKey(value);

  if (dateKey === formatDateKey(today)) {
    return `Today at ${formatTimeLabel(value)}`;
  }

  if (dateKey === formatDateKey(tomorrow)) {
    return `Tomorrow at ${formatTimeLabel(value)}`;
  }

  return `${formatCalendarLabel(value)} at ${formatTimeLabel(value)}`;
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
      const parsedReminder = parseReminderDate(reminder);
      const endTime = parsedReminder.date;
      const isValid = parsedReminder.parseStrategy !== 'fallback';
      const now = Date.now();

      console.log('[buildCalendarActivities] reminder payload', {
        _id: reminder._id,
        createdAt: reminder.createdAt,
        description: reminder.description,
        endTime: reminder.endTime,
        isClockOnly: parsedReminder.isClockOnly,
        isValidEndTime: isValid,
        parseStrategy: parsedReminder.parseStrategy,
        parsedEndTime: endTime.toString(),
        title: reminder.title,
        updatedAt: reminder.updatedAt,
        whyTimeUnavailable:
          isValid
            ? null
            : 'The reminder endTime is neither a full datetime nor a valid HH:mm time string.',
      });

      return {
        description: reminder.description?.trim() || undefined,
        id: reminder._id,
        date: isValid ? formatDateKey(endTime) : formatDateKey(new Date()),
        detail: isValid ? formatTimeLabel(endTime) : 'Time unavailable',
        isFuture: isValid ? endTime.getTime() > now : false,
        title: reminder.title,
        type: 'booking',
      } satisfies CalendarActivity;
    })
    .sort((left, right) => `${left.date} ${left.detail}`.localeCompare(`${right.date} ${right.detail}`));
}

export function buildDailySnapshot(
  memoryRecord: UserMemoryRecord | null,
  reminders: ReminderRecord[],
): HomeSnapshotStat[] {
  const todayKey = formatDateKey(new Date());
  const remindersToday = reminders.filter((item) => {
    const parsedReminder = parseReminderDate(item);
    return parsedReminder.parseStrategy !== 'fallback'
      ? formatDateKey(parsedReminder.date) === todayKey
      : false;
  }).length;

  return [
    {
      id: 'today-reminders',
      label: 'REMINDERS TODAY',
      value: `${remindersToday}`,
    },
    {
      id: 'memory-notes',
      label: 'MEMORY NOTES',
      value: `${memoryRecord?.memories.length ?? 0}`,
    },
    {
      id: 'profile-status',
      label: 'PROFILE',
      value: memoryRecord ? 'Linked' : 'Pending',
    },
  ];
}

export function buildUpcomingReminder(reminders: ReminderRecord[]): HomeUpcomingReminder | null {
  const nextReminder = [...reminders]
    .map((item) => ({ item, parsedReminder: getNextReminderOccurrence(item) }))
    .filter(({ parsedReminder }) => parsedReminder.parseStrategy !== 'fallback')
    .sort((left, right) => left.parsedReminder.date.getTime() - right.parsedReminder.date.getTime())[0];

  if (!nextReminder) {
    return null;
  }

  return {
    description: nextReminder.item.description?.trim() || 'No extra details added for this reminder.',
    detail: formatReminderDetail(nextReminder.parsedReminder.date),
    id: nextReminder.item._id,
    title: nextReminder.item.title,
  };
}

export function buildRecentActivity(reminders: ReminderRecord[]): HomeSummaryActivity[] {
  return [...reminders]
    .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
    .slice(0, 2)
    .map((reminder) => {
      const parsedReminder = parseReminderDate(reminder);
      const endTime = parsedReminder.date;
      const fallbackDescription = parsedReminder.parseStrategy !== 'fallback'
        ? `Scheduled for ${new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(endTime)}`
        : 'Scheduled time unavailable';

      return {
        description: reminder.description?.trim() || fallbackDescription,
        id: reminder._id,
        title: reminder.title,
      };
    });
}
