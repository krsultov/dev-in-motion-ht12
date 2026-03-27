import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, IconButton, Surface, Text } from 'react-native-paper';

import type { CalendarActivity, CalendarActivityType } from '@/data/dummy';

const weekdayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const activityTypeColors: Record<CalendarActivityType, string> = {
  assistant: '#8B8DF1',
  booking: '#7ED8A6',
  trip: '#F3B267',
};

function formatDateKey(value: Date) {
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfMonthDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), 1);
}

function endOfMonthDate(value: Date) {
  return new Date(value.getFullYear(), value.getMonth() + 1, 0);
}

function shiftMonth(value: Date, offset: number) {
  return new Date(value.getFullYear(), value.getMonth() + offset, 1);
}

function startOfWeekMonday(value: Date) {
  const next = new Date(value);
  const dayOfWeek = (next.getDay() + 6) % 7;
  next.setDate(next.getDate() - dayOfWeek);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfWeekMonday(value: Date) {
  const next = startOfWeekMonday(value);
  next.setDate(next.getDate() + 6);
  return next;
}

function eachDayBetween(start: Date, end: Date) {
  const days: Date[] = [];
  const cursor = new Date(start);

  while (cursor.getTime() <= end.getTime()) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function isSameMonthDate(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

function isTodayDate(value: Date, today: Date) {
  return formatDateKey(value) === formatDateKey(today);
}

function formatMonthLabel(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(value);
}

function formatSelectedDateLabel(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(new Date(year, month - 1, day));
}

type HomeMonthCalendarProps = {
  activities: CalendarActivity[];
};

export function HomeMonthCalendar({ activities }: HomeMonthCalendarProps) {
  const today = new Date();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonthDate(today));

  const activitiesByDate = useMemo(
    () =>
      activities.reduce<Record<string, CalendarActivity[]>>((acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = [];
        }

        acc[item.date].push(item);
        return acc;
      }, {}),
    [activities],
  );

  const monthDays = useMemo(() => {
    const monthStart = startOfMonthDate(visibleMonth);
    const monthEnd = endOfMonthDate(visibleMonth);

    return eachDayBetween(startOfWeekMonday(monthStart), endOfWeekMonday(monthEnd));
  }, [visibleMonth]);

  const defaultSelectedDate = useMemo(() => {
    const inMonth = activities
      .filter((item) => {
        const [year, month] = item.date.split('-').map(Number);
        return year === visibleMonth.getFullYear() && month - 1 === visibleMonth.getMonth();
      })
      .map((item) => item.date)
      .sort()[0];

    return inMonth ?? null;
  }, [activities, visibleMonth]);

  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const todayKey = formatDateKey(today);
    return activities.some((item) => item.date === todayKey) ? todayKey : null;
  });

  const resolvedSelectedDate =
    selectedDate &&
    activitiesByDate[selectedDate]?.some((item) => {
      const [year, month] = item.date.split('-').map(Number);
      return year === visibleMonth.getFullYear() && month - 1 === visibleMonth.getMonth();
    })
      ? selectedDate
      : defaultSelectedDate;

  const selectedActivities = resolvedSelectedDate ? activitiesByDate[resolvedSelectedDate] ?? [] : [];

  const handleChangeMonth = (offset: number) => {
    setVisibleMonth((current) => shiftMonth(current, offset));
  };

  return (
    <Card mode="outlined" style={styles.calendarCard}>
      <Card.Content style={styles.calendarContent}>
        <View style={styles.calendarHeader}>
          <View style={styles.calendarHeading}>
            <Text variant="titleMedium" style={styles.calendarTitle}>
              Activity calendar
            </Text>
            <Text variant="bodySmall" style={styles.calendarSubtitle}>
              Browse past and upcoming plans, then tap a marked day for details.
            </Text>
          </View>
          <View style={styles.monthSwitcher}>
            <IconButton
              icon={() => <Ionicons name="chevron-back" size={18} color="#FFFFFF" />}
              size={18}
              style={styles.monthButton}
              onPress={() => handleChangeMonth(-1)}
            />
            <Text variant="titleSmall" style={styles.monthLabel}>
              {formatMonthLabel(visibleMonth)}
            </Text>
            <IconButton
              icon={() => <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />}
              size={18}
              style={styles.monthButton}
              onPress={() => handleChangeMonth(1)}
            />
          </View>
        </View>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: activityTypeColors.assistant }]} />
            <Text variant="bodySmall" style={styles.legendText}>
              AI talks
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: activityTypeColors.booking }]} />
            <Text variant="bodySmall" style={styles.legendText}>
              Bookings
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: activityTypeColors.trip }]} />
            <Text variant="bodySmall" style={styles.legendText}>
              Trips
            </Text>
          </View>
        </View>

        <View style={styles.weekdayRow}>
          {weekdayLabels.map((label) => (
            <Text key={label} variant="bodySmall" style={styles.weekdayLabel}>
              {label}
            </Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {monthDays.map((day) => {
            const dayKey = formatDateKey(day);
            const dayActivities = activitiesByDate[dayKey] ?? [];
            const hasActivities = dayActivities.length > 0;
            const uniqueTypes = Array.from(new Set(dayActivities.map((item) => item.type)));
            const isSelected = resolvedSelectedDate ? dayKey === resolvedSelectedDate : false;

            return (
              <Pressable
                key={dayKey}
                disabled={!hasActivities}
                onPress={() => setSelectedDate(dayKey)}
                style={[
                  styles.dayCell,
                  isSelected ? styles.dayCellSelected : null,
                  isTodayDate(day, today) ? styles.dayCellToday : null,
                  !isSameMonthDate(day, visibleMonth) ? styles.dayCellMuted : null,
                ]}>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.dayNumber,
                    !isSameMonthDate(day, visibleMonth) ? styles.dayNumberMuted : null,
                    hasActivities ? styles.dayNumberActive : null,
                  ]}>
                  {day.getDate()}
                </Text>
                <View style={styles.dotRow}>
                  {uniqueTypes.map((type) => (
                    <View
                      key={type}
                      style={[styles.dayDot, { backgroundColor: activityTypeColors[type] }]}
                    />
                  ))}
                </View>
              </Pressable>
            );
          })}
        </View>

        {selectedActivities.length > 0 ? (
          <Surface style={styles.activityDrawer} elevation={0}>
            <Text variant="titleSmall" style={styles.activityDrawerTitle}>
              {resolvedSelectedDate ? formatSelectedDateLabel(resolvedSelectedDate) : ''}
            </Text>
            {selectedActivities.map((item) => (
              <View key={item.id} style={styles.activityDrawerRow}>
                <View
                  style={[styles.activityDrawerDot, { backgroundColor: activityTypeColors[item.type] }]}
                />
                <View style={styles.activityDrawerCopy}>
                  <Text variant="bodyMedium" style={styles.activityDrawerItemTitle}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.activityDrawerItemDetail}>
                    {item.detail}
                    {item.isFuture ? ' | upcoming' : ''}
                  </Text>
                </View>
              </View>
            ))}
          </Surface>
        ) : (
          <Surface style={styles.emptyState} elevation={0}>
            <Text variant="bodyMedium" style={styles.emptyStateTitle}>
              No marked days this month yet
            </Text>
            <Text variant="bodySmall" style={styles.emptyStateText}>
              Try another month to see older activity or upcoming scheduled plans.
            </Text>
          </Surface>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303038',
    borderRadius: 20,
    marginTop: 10,
  },
  calendarContent: {
    gap: 14,
  },
  calendarHeader: {
    gap: 12,
  },
  calendarHeading: {
    gap: 4,
  },
  calendarTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  calendarSubtitle: {
    color: '#8A8A96',
    lineHeight: 18,
    maxWidth: 280,
  },
  monthSwitcher: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthButton: {
    backgroundColor: '#171717',
    margin: 0,
  },
  monthLabel: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  legendDot: {
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  legendText: {
    color: '#A1A1AA',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  weekdayLabel: {
    color: '#7C7C87',
    textAlign: 'center',
    width: `${100 / 7}%`,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between',
  },
  dayCell: {
    alignItems: 'center',
    backgroundColor: '#171717',
    borderColor: '#23232A',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 52,
    paddingBottom: 8,
    paddingTop: 7,
    width: '13%',
  },
  dayCellSelected: {
    backgroundColor: '#23244D',
    borderColor: '#8B8DF1',
  },
  dayCellToday: {
    borderColor: '#4D4FA0',
  },
  dayCellMuted: {
    opacity: 0.4,
  },
  dayNumber: {
    color: '#6B6B76',
    fontWeight: '600',
  },
  dayNumberActive: {
    color: '#FFFFFF',
  },
  dayNumberMuted: {
    color: '#5B5B63',
  },
  dotRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 3,
    justifyContent: 'center',
    marginTop: 6,
    minHeight: 8,
  },
  dayDot: {
    borderRadius: 99,
    height: 6,
    width: 6,
  },
  activityDrawer: {
    backgroundColor: '#171717',
    borderColor: '#2D2D2D',
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  activityDrawerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activityDrawerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  activityDrawerDot: {
    borderRadius: 99,
    height: 10,
    marginTop: 5,
    width: 10,
  },
  activityDrawerCopy: {
    flex: 1,
  },
  activityDrawerItemTitle: {
    color: '#FFFFFF',
    lineHeight: 20,
  },
  activityDrawerItemDetail: {
    color: '#8A8A96',
    marginTop: 3,
  },
  emptyState: {
    backgroundColor: '#171717',
    borderColor: '#2D2D2D',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  emptyStateTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyStateText: {
    color: '#8A8A96',
    lineHeight: 18,
    marginTop: 4,
  },
});
