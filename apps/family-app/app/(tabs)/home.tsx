import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Surface, Text } from 'react-native-paper';

import { HomeMonthCalendar } from '@/components/home-month-calendar';
import { ScreenShell } from '@/components/screen-shell';
import { StatusTag } from '@/components/status-tag';
import { useAuth } from '@/context/auth-context';
import {
  buildCalendarActivities,
  buildElderProfile,
  buildRecentActivity,
} from '@/lib/dashboard-data';
import { getCurrentUserMemory, getLatestUserMemoryRecord } from '@/lib/memory-api';
import { listReminders } from '@/lib/reminders-api';
import type { UserMemoryRecord } from '@/types/memory';
import type { ReminderRecord } from '@/types/reminder';

export default function HomeScreen() {
  const { user } = useAuth();
  const userName = user?.name ?? null;
  const userPhone = user?.phone ?? null;
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(null);
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedPhone, setResolvedPhone] = useState<string | null>(userPhone);
  const [resolvedUserName, setResolvedUserName] = useState<string | null>(userName);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        console.log('[home-screen] loadDashboard:start', { user });
        const fallbackRecord = !userPhone ? await getLatestUserMemoryRecord() : null;
        const activePhone = userPhone?.trim() || fallbackRecord?.phone?.trim() || '';
        const activeName = userName?.trim() || fallbackRecord?.name?.trim() || 'Family';

        console.log('[home-screen] active identity resolved', {
          activeName,
          activePhone,
          fallbackRecord,
          user,
        });

        setResolvedPhone(activePhone || null);
        setResolvedUserName(activeName || null);

        const [memoryResult, remindersResult] = await Promise.allSettled([
          activePhone ? getCurrentUserMemory(activePhone) : Promise.resolve(fallbackRecord),
          listReminders(),
        ]);

        if (!isMounted) {
          return;
        }

        const nextErrors: string[] = [];

        if (memoryResult.status === 'fulfilled') {
          setMemoryRecord(memoryResult.value);
          console.log('[home-screen] memory fetch resolved', { memoryRecord: memoryResult.value });
        } else {
          setMemoryRecord(null);
          nextErrors.push(
            memoryResult.reason instanceof Error
              ? `Memory: ${memoryResult.reason.message}`
              : 'Memory data could not be loaded.',
          );
          console.log('[home-screen] memory fetch failed', { reason: memoryResult.reason });
        }

        if (remindersResult.status === 'fulfilled') {
          setReminders(remindersResult.value);
          console.log('[home-screen] reminders fetch resolved', { reminders: remindersResult.value });
        } else {
          setReminders([]);
          nextErrors.push(
            remindersResult.reason instanceof Error
              ? `Reminders: ${remindersResult.reason.message}`
              : 'Reminder data could not be loaded.',
          );
          console.log('[home-screen] reminders fetch failed', { reason: remindersResult.reason });
        }

        setErrorMessage(nextErrors.length > 0 ? nextErrors.join(' ') : null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMemoryRecord(null);
        setReminders([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load dashboard data.');
        console.log('[home-screen] loadDashboard:failed', { error });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [user, userName, userPhone]);

  useEffect(() => {
    console.log('[home-screen] render state', {
      errorMessage,
      isLoading,
      memoryRecord,
      remindersCount: reminders.length,
      resolvedPhone,
      resolvedUserName,
    });
  }, [errorMessage, isLoading, memoryRecord, reminders, resolvedPhone, resolvedUserName]);

  const elderProfile = useMemo(
    () => buildElderProfile(memoryRecord, resolvedPhone),
    [memoryRecord, resolvedPhone],
  );
  const calendarMonthActivities = useMemo(() => buildCalendarActivities(reminders), [reminders]);
  const recentItems = useMemo(() => buildRecentActivity(reminders), [reminders]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayCount = calendarMonthActivities.filter((item) => item.date === todayKey).length;

  return (
    <ScreenShell>
      <Text variant="headlineSmall" style={styles.title}>
        Good morning, {resolvedUserName ?? 'Family'}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Your mother&apos;s assistant is active and keeping things on track.
      </Text>

      <Surface style={styles.heroCard} elevation={1}>
        <View style={styles.heroTopRow}>
          <Avatar.Text
            size={54}
            label={elderProfile.initials}
            labelStyle={styles.avatarLabel}
            style={styles.avatar}
          />
          <View style={styles.heroText}>
            <Text variant="titleLarge" style={styles.parentName}>
              {elderProfile.name}
            </Text>
            <Text variant="bodySmall" style={styles.parentMeta}>
              Last updated: {elderProfile.lastUpdatedLabel}
            </Text>
          </View>
        </View>

        <View style={styles.heroTags}>
          <StatusTag
            label={elderProfile.aiActive ? 'AI active' : 'AI inactive'}
            tone={elderProfile.aiActive ? 'approved' : 'declined'}
          />
          <StatusTag label={`${todayCount} reminders today`} tone="calendar" />
        </View>
      </Surface>

      {isLoading ? (
        <Card mode="outlined" style={styles.stateCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.stateText}>
              Loading live dashboard data.
            </Text>
          </Card.Content>
        </Card>
      ) : null}

      {!isLoading && errorMessage ? (
        <Card mode="outlined" style={styles.stateCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.stateText}>
              {errorMessage}
            </Text>
          </Card.Content>
        </Card>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Recent reminders
        </Text>
      </View>

      <Card mode="outlined" style={styles.timelineCard}>
        <Card.Content style={styles.timelineContent}>
          {recentItems.length > 0 ? (
            recentItems.map((item, index) => (
              <View key={item.id} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View
                    style={[styles.timelineDot, index === 1 ? styles.timelineDotSecondary : null]}
                  />
                  {index < recentItems.length - 1 ? <View style={styles.timelineLine} /> : null}
                </View>
                <View style={styles.timelineTextBlock}>
                  <Text variant="titleSmall" style={styles.timelineTitle}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={styles.timelineDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              No reminders yet.
            </Text>
          )}
        </Card.Content>
      </Card>

      <HomeMonthCalendar activities={calendarMonthActivities} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#A1A1AA',
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 8,
    maxWidth: 320,
  },
  heroCard: {
    backgroundColor: '#CDCFFC',
    borderColor: '#CDCFFC',
    borderRadius: 22,
    marginBottom: 26,
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  heroTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    backgroundColor: '#B7BAF8',
  },
  avatarLabel: {
    color: '#23244D',
    fontWeight: '700',
  },
  heroText: {
    flex: 1,
  },
  parentName: {
    color: '#23244D',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  parentMeta: {
    color: '#4D4FA0',
    marginTop: 4,
  },
  heroTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  stateCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303038',
    borderRadius: 18,
    marginBottom: 18,
  },
  stateText: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
  sectionTitle: {
    color: '#A1A1AA',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timelineCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303038',
    borderRadius: 18,
    marginBottom: 16,
  },
  timelineContent: {
    gap: 16,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineRail: {
    alignItems: 'center',
    width: 12,
  },
  timelineDot: {
    backgroundColor: '#8B8DF1',
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  timelineDotSecondary: {
    backgroundColor: '#D4F4E4',
  },
  timelineLine: {
    backgroundColor: '#2D2D2D',
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  timelineTextBlock: {
    flex: 1,
    paddingBottom: 2,
  },
  timelineTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    lineHeight: 20,
  },
  timelineDescription: {
    color: '#A1A1AA',
    lineHeight: 18,
    marginTop: 4,
  },
  emptyText: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
});
