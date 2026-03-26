import { format, isToday, isYesterday, parseISO } from 'date-fns';

import type { ActivityItem } from '@/types/api';

type GroupedActivity = {
  label: string;
  data: ActivityItem[];
};

function getFallbackTime(label: string) {
  if (label === 'Today') {
    return Date.now();
  }

  if (label === 'Yesterday') {
    return Date.now() - 24 * 60 * 60 * 1000;
  }

  return 0;
}

export function groupByDay(items: ActivityItem[]): GroupedActivity[] {
  const groups = new Map<string, { data: ActivityItem[]; sortTime: number }>();

  items.forEach((item) => {
    let label = item.day ?? 'Unknown';
    let sortTime = getFallbackTime(label);

    if (item.timestamp) {
      const parsed = parseISO(item.timestamp);

      if (!Number.isNaN(parsed.getTime())) {
        label = isToday(parsed)
          ? 'Today'
          : isYesterday(parsed)
            ? 'Yesterday'
            : format(parsed, 'EEEE, MMM d');
        sortTime = parsed.getTime();
      }
    }

    const existing = groups.get(label);

    if (existing) {
      existing.data.push(item);
      existing.sortTime = Math.max(existing.sortTime, sortTime);
      return;
    }

    groups.set(label, { data: [item], sortTime });
  });

  return Array.from(groups.entries())
    .sort((a, b) => b[1].sortTime - a[1].sortTime)
    .map(([label, value]) => ({
      label,
      data: value.data,
    }));
}
