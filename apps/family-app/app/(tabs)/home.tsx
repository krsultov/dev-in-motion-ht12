import { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Avatar, Card, Surface, Text } from "react-native-paper";

import { HomeMonthCalendar } from "@/components/home-month-calendar";
import { ScreenShell } from "@/components/screen-shell";
import { StatusTag } from "@/components/status-tag";
import { useAuth } from "@/context/auth-context";
import {
  buildCalendarActivities,
  buildElderProfile,
  buildUpcomingReminder,
} from "@/lib/dashboard-data";
import {
  getCurrentUserMemory,
  getUserTotalCallMinutes,
  listRecentCalls,
  type RecentCallItem,
} from "@/lib/memory-api";
import { listReminders } from "@/lib/reminders-api";
import type { UserMemoryRecord } from "@/types/memory";
import type { ReminderRecord } from "@/types/reminder";

const GREETING_LABEL = "\u0417\u0434\u0440\u0430\u0432\u0435\u0439";
const LAST_UPDATED_LABEL =
  "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u043e \u043e\u0431\u043d\u043e\u0432\u044f\u0432\u0430\u043d\u0435";
const AI_ACTIVE_LABEL = "AI \u0430\u043a\u0442\u0438\u0432\u043d\u043e";
const AI_INACTIVE_LABEL =
  "AI \u043d\u0435\u0430\u043a\u0442\u0438\u0432\u043d\u043e";
const PHONE_LABEL =
  "\u0421\u0432\u044a\u0440\u0437\u0430\u043d \u0442\u0435\u043b\u0435\u0444\u043e\u043d";
const LOADING_LABEL =
  "\u0417\u0430\u0440\u0435\u0436\u0434\u0430\u043d\u0435 \u043d\u0430 \u0442\u0430\u0431\u043b\u043e\u0442\u043e \u0441 \u0434\u0430\u043d\u043d\u0438 \u0432 \u0440\u0435\u0430\u043b\u043d\u043e \u0432\u0440\u0435\u043c\u0435.";
const NEXT_LABEL = "\u0421\u043b\u0435\u0434\u0432\u0430\u0449\u043e";
const RECENT_CALLS_LABEL = "Скорошни разговори";
const NO_RECENT_CALLS_LABEL = "Няма скорошни разговори";
const TOTAL_AI_TIME_LABEL = "ОБЩО ВРЕМЕ С AI";
const DURATION_UNAVAILABLE_LABEL = "Продължителността не е достъпна";
const UPCOMING_REMINDER_LABEL =
  "\u041f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u043e \u043d\u0430\u043f\u043e\u043c\u043d\u044f\u043d\u0435";
const NO_UPCOMING_REMINDERS_LABEL =
  "\u0412\u0441\u0435 \u043e\u0449\u0435 \u043d\u044f\u043c\u0430 \u043f\u0440\u0435\u0434\u0441\u0442\u043e\u044f\u0449\u0438 \u043d\u0430\u043f\u043e\u043c\u043d\u044f\u043d\u0438\u044f.";

function formatCallDuration(durationSec: number | null) {
  if (typeof durationSec !== "number") {
    return DURATION_UNAVAILABLE_LABEL;
  }

  return `${Math.max(1, Math.round(durationSec / 60))} min`;
}

function formatCallStartedAt(startedAt: string) {
  const parsedDate = new Date(startedAt);
  if (Number.isNaN(parsedDate.getTime())) {
    return startedAt;
  }

  return new Intl.DateTimeFormat("bg-BG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsedDate);
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(
    null,
  );
  const [reminders, setReminders] = useState<ReminderRecord[]>([]);
  const [recentCalls, setRecentCalls] = useState<RecentCallItem[]>([]);
  const [totalCallMinutes, setTotalCallMinutes] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (!user?.phone) {
        setMemoryRecord(null);
        setReminders([]);
        setRecentCalls([]);
        setTotalCallMinutes(0);
        setErrorMessage(
          "Sign in with a phone number to load live dashboard data.",
        );
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [
          memoryResult,
          remindersResult,
          callMinutesResult,
          recentCallsResult,
        ] = await Promise.allSettled([
          getCurrentUserMemory(user.phone),
          listReminders(user.phone),
          getUserTotalCallMinutes(user.phone),
          listRecentCalls(user.phone, 4),
        ]);

        if (!isMounted) {
          return;
        }

        const nextErrors: string[] = [];

        if (memoryResult.status === "fulfilled") {
          setMemoryRecord(memoryResult.value);
        } else {
          setMemoryRecord(null);
          nextErrors.push(
            memoryResult.reason instanceof Error
              ? `Memory: ${memoryResult.reason.message}`
              : "Memory data could not be loaded.",
          );
        }

        if (remindersResult.status === "fulfilled") {
          setReminders(remindersResult.value);
        } else {
          setReminders([]);
          nextErrors.push(
            remindersResult.reason instanceof Error
              ? `Reminders: ${remindersResult.reason.message}`
              : "Reminder data could not be loaded.",
          );
        }

        if (callMinutesResult.status === "fulfilled") {
          setTotalCallMinutes(callMinutesResult.value);
        } else {
          setTotalCallMinutes(0);
          nextErrors.push(
            callMinutesResult.reason instanceof Error
              ? `Call minutes: ${callMinutesResult.reason.message}`
              : "Call minutes could not be loaded.",
          );
        }

        if (recentCallsResult.status === "fulfilled") {
          setRecentCalls(recentCallsResult.value);
        } else {
          setRecentCalls([]);
          nextErrors.push(
            recentCallsResult.reason instanceof Error
              ? `Recent calls: ${recentCallsResult.reason.message}`
              : "Recent calls could not be loaded.",
          );
        }

        setErrorMessage(nextErrors.length > 0 ? nextErrors.join(" ") : null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMemoryRecord(null);
        setReminders([]);
        setRecentCalls([]);
        setTotalCallMinutes(0);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load dashboard data.",
        );
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
  }, [user?.phone]);

  const elderProfile = useMemo(
    () => buildElderProfile(memoryRecord, user?.phone ?? null),
    [memoryRecord, user?.phone],
  );
  const calendarMonthActivities = useMemo(
    () => buildCalendarActivities(reminders),
    [reminders],
  );
  const upcomingReminder = useMemo(
    () => buildUpcomingReminder(reminders),
    [reminders],
  );
  const formattedRecentCalls = useMemo(
    () =>
      recentCalls.map((call) => ({
        ...call,
        durationLabel: formatCallDuration(call.durationSec),
        timeLabel: formatCallStartedAt(call.startedAt),
      })),
    [recentCalls],
  );

  return (
    <ScreenShell>
      <Text variant="headlineSmall" style={styles.title}>
        {GREETING_LABEL}, {user?.name}
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
              {LAST_UPDATED_LABEL}: {elderProfile.lastUpdatedLabel}
            </Text>
          </View>
        </View>

        <View style={styles.heroFooter}>
          <StatusTag
            label={elderProfile.aiActive ? AI_ACTIVE_LABEL : AI_INACTIVE_LABEL}
            tone={elderProfile.aiActive ? "approved" : "declined"}
          />

          <View style={styles.heroStatsRow}>
            <Surface style={styles.heroStatCard} elevation={0}>
              <Text variant="bodySmall" style={styles.heroStatLabel}>
                {TOTAL_AI_TIME_LABEL}
              </Text>
              <Text variant="titleMedium" style={styles.heroStatValue}>
                {totalCallMinutes} мин
              </Text>
            </Surface>

            <Surface style={styles.heroStatCard} elevation={0}>
              <Text variant="bodySmall" style={styles.heroStatLabel}>
                {PHONE_LABEL}
              </Text>
              <Text variant="bodyMedium" style={styles.heroStatValue}>
                {elderProfile.phone}
              </Text>
            </Surface>
          </View>
        </View>
      </Surface>

      <Card mode="outlined" style={styles.callsCard}>
        <Card.Content style={styles.callsContent}>
          <Text variant="titleMedium" style={styles.callsTitle}>
            {RECENT_CALLS_LABEL}
          </Text>

          {formattedRecentCalls.length > 0 ? (
            <View style={styles.callsList}>
              {formattedRecentCalls.map((call) => (
                <View key={call.id} style={styles.callRow}>
                  <View style={styles.callCopy}>
                    <Text variant="bodyMedium" style={styles.callTime}>
                      {call.timeLabel}
                    </Text>
                    <Text variant="bodySmall" style={styles.callMeta}>
                      {call.durationLabel}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.callsEmpty}>
              {NO_RECENT_CALLS_LABEL}
            </Text>
          )}
        </Card.Content>
      </Card>

      {isLoading ? (
        <Card mode="outlined" style={styles.stateCard}>
          <Card.Content>
            <Text variant="bodyMedium" style={styles.stateText}>
              {LOADING_LABEL}
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
          {NEXT_LABEL}
        </Text>
      </View>

      <Card mode="outlined" style={styles.timelineCard}>
        <Card.Content style={styles.timelineContent}>
          {upcomingReminder ? (
            <View style={styles.nextUpBlock}>
              <View style={styles.nextUpBadge}>
                <Text variant="bodySmall" style={styles.nextUpBadgeText}>
                  {UPCOMING_REMINDER_LABEL}
                </Text>
              </View>
              <Text variant="titleMedium" style={styles.nextUpTitle}>
                {upcomingReminder.title}
              </Text>
              <Text variant="bodyMedium" style={styles.nextUpDetail}>
                {upcomingReminder.detail}
              </Text>
              <Text variant="bodySmall" style={styles.timelineDescription}>
                {upcomingReminder.description}
              </Text>
            </View>
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>
              {NO_UPCOMING_REMINDERS_LABEL}
            </Text>
          )}
        </Card.Content>
      </Card>

      <HomeMonthCalendar reminders={calendarMonthActivities} />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 40,
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "#A1A1AA",
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 8,
    maxWidth: 320,
  },
  heroCard: {
    backgroundColor: "#CDCFFC",
    borderColor: "#CDCFFC",
    borderRadius: 22,
    marginBottom: 18,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  heroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  avatar: {
    backgroundColor: "#B7BAF8",
  },
  avatarLabel: {
    color: "#23244D",
    fontWeight: "700",
  },
  heroText: {
    flex: 1,
  },
  parentName: {
    color: "#23244D",
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  parentMeta: {
    color: "#4D4FA0",
    marginTop: 4,
  },
  heroFooter: {
    gap: 14,
    marginTop: 18,
  },
  heroStatsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  heroStatCard: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    borderRadius: 16,
    flex: 1,
    justifyContent: "center",
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroStatLabel: {
    color: "#4D4FA0",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  heroStatValue: {
    color: "#23244D",
    fontWeight: "700",
    marginTop: 6,
  },
  callsCard: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 18,
    marginBottom: 18,
  },
  callsContent: {
    gap: 14,
  },
  callsTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  callsList: {
    gap: 10,
  },
  callRow: {
    backgroundColor: "#171717",
    borderColor: "#26262C",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  callCopy: {
    gap: 4,
  },
  callTime: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  callMeta: {
    color: "#A1A1AA",
  },
  callsEmpty: {
    color: "#A1A1AA",
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  stateCard: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 18,
    marginBottom: 18,
  },
  stateText: {
    color: "#A1A1AA",
    lineHeight: 20,
  },
  sectionTitle: {
    color: "#A1A1AA",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  timelineCard: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 18,
    marginBottom: 16,
  },
  timelineContent: {
    gap: 16,
  },
  nextUpBlock: {
    gap: 10,
  },
  nextUpBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#23244D",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  nextUpBadgeText: {
    color: "#CDCFFC",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  nextUpTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  nextUpDetail: {
    color: "#D4F4E4",
    fontWeight: "600",
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineRail: {
    alignItems: "center",
    width: 12,
  },
  timelineDot: {
    backgroundColor: "#8B8DF1",
    borderRadius: 99,
    height: 8,
    width: 8,
  },
  timelineDotSecondary: {
    backgroundColor: "#D4F4E4",
  },
  timelineLine: {
    backgroundColor: "#2D2D2D",
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  timelineTextBlock: {
    flex: 1,
    paddingBottom: 2,
  },
  timelineTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 20,
  },
  timelineDescription: {
    color: "#A1A1AA",
    lineHeight: 18,
    marginTop: 4,
  },
  emptyText: {
    color: "#A1A1AA",
    lineHeight: 20,
  },
});
