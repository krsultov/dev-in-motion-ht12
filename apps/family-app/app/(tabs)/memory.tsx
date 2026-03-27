import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Card, Text } from "react-native-paper";

import { MemorySectionCard } from "@/components/memory-section-card";
import { ScreenShell } from "@/components/screen-shell";
import { useAuth } from "@/context/auth-context";
import { getCurrentUserMemory, memoryApiBaseUrl } from "@/lib/memory-api";
import type { UserMemoryRecord } from "@/types/memory";

type MedicationTimelineItem = {
  id: string;
  name: string;
  schedule: string;
  period: "Morning" | "Midday" | "Evening" | "Anytime";
};

function getMedicationPeriod(
  schedule: string,
): MedicationTimelineItem["period"] {
  const normalizedSchedule = schedule.toLowerCase();

  if (
    normalizedSchedule.includes("morning") ||
    normalizedSchedule.includes("breakfast") ||
    normalizedSchedule.includes("am")
  ) {
    return "Morning";
  }

  if (
    normalizedSchedule.includes("afternoon") ||
    normalizedSchedule.includes("midday") ||
    normalizedSchedule.includes("lunch") ||
    normalizedSchedule.includes("noon")
  ) {
    return "Midday";
  }

  if (
    normalizedSchedule.includes("evening") ||
    normalizedSchedule.includes("night") ||
    normalizedSchedule.includes("bed") ||
    normalizedSchedule.includes("pm")
  ) {
    return "Evening";
  }

  return "Anytime";
}

function buildMedicationTimeline(
  memoryRecord: UserMemoryRecord | null,
): MedicationTimelineItem[] {
  if (!memoryRecord) {
    return [];
  }

  const periodOrder: Record<MedicationTimelineItem["period"], number> = {
    Morning: 0,
    Midday: 1,
    Evening: 2,
    Anytime: 3,
  };

  return [...memoryRecord.medications]
    .map((item) => ({
      id: item.id,
      name: item.name,
      period: getMedicationPeriod(item.schedule),
      schedule: item.schedule,
    }))
    .sort((left, right) => {
      const periodDifference =
        periodOrder[left.period] - periodOrder[right.period];
      return periodDifference !== 0
        ? periodDifference
        : left.name.localeCompare(right.name);
    });
}

export default function MemoryScreen() {
  const { user } = useAuth();
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMemory = useCallback(
    async (
      mode: "initial" | "refresh" = "initial",
      options?: { signal?: { aborted: boolean } },
    ) => {
      if (!user?.phone) {
        setMemoryRecord(null);
        setErrorMessage("Sign in with a phone number to load memory data.");
        setIsLoading(false);
        return;
      }

      if (mode !== "refresh") {
        setIsLoading(true);
      }

      try {
        const record = await getCurrentUserMemory(user.phone);
        if (options?.signal?.aborted) {
          return;
        }

        setMemoryRecord(record);
        setErrorMessage(null);
      } catch (error) {
        if (options?.signal?.aborted) {
          return;
        }

        setMemoryRecord(null);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load memory data right now.",
        );
      } finally {
        if (!options?.signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [user?.phone],
  );

  useEffect(() => {
    const request = { aborted: false };
    void loadMemory("initial", { signal: request });

    return () => {
      request.aborted = true;
    };
  }, [loadMemory]);
  console.log(memoryRecord);

  const screenTitle = memoryRecord?.name
    ? `${memoryRecord.name}'s profile`
    : "Memory profile";
  const medicationTimeline = useMemo(
    () => buildMedicationTimeline(memoryRecord),
    [memoryRecord],
  );

  return (
    <ScreenShell contentContainerStyle={styles.contentContainer}>
      <Text variant="headlineSmall" style={styles.title}>
        {screenTitle}
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        What the AI knows about your family member.
      </Text>

      <View style={styles.statusBlock}>
        <Text variant="bodySmall" style={styles.statusLabel}>
          Linked phone
        </Text>
        <Text variant="bodyMedium" style={styles.statusValue}>
          {user?.phone ?? "Not available"}
        </Text>
      </View>

      {isLoading ? (
        <Card mode="outlined" style={styles.feedbackCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.feedbackTitle}>
              Loading memory
            </Text>
            <Text variant="bodyMedium" style={styles.feedbackBody}>
              Fetching medications, contacts, and preferences from{" "}
              {memoryApiBaseUrl}.
            </Text>
          </Card.Content>
        </Card>
      ) : null}

      {!isLoading && errorMessage ? (
        <Card mode="outlined" style={styles.feedbackCard}>
          <Card.Content style={styles.feedbackContent}>
            <View style={styles.feedbackText}>
              <Text variant="titleMedium" style={styles.feedbackTitle}>
                Couldn&apos;t load memory
              </Text>
              <Text variant="bodyMedium" style={styles.feedbackBody}>
                {errorMessage}
              </Text>
            </View>
            <Button
              mode="contained"
              buttonColor="#8B8DF1"
              textColor="#18181B"
              onPress={() => void loadMemory()}
            >
              Try again
            </Button>
          </Card.Content>
        </Card>
      ) : null}

      {!isLoading && !errorMessage && !memoryRecord ? (
        <Card mode="outlined" style={styles.feedbackCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.feedbackTitle}>
              No memory found yet
            </Text>
            <Text variant="bodyMedium" style={styles.feedbackBody}>
              We didn&apos;t find a memory record for this phone number yet.
            </Text>
          </Card.Content>
        </Card>
      ) : null}

      <MemorySectionCard
        title="Memory notes"
        iconName="book"
        accentColor="#8B8DF1"
        rows={(memoryRecord?.memories ?? []).map((item, index) => ({
          id: `${memoryRecord?._id ?? "memory"}-note-${index + 1}`,
          label: item,
          detail: `Memory ${index + 1}`,
        }))}
        emptyMessage="No memory notes stored yet."
      />

      <MemorySectionCard
        title="Medications"
        iconName="medical"
        accentColor="#534AB7"
        rows={(memoryRecord?.medications ?? []).map((item) => ({
          id: item.id,
          label: item.name,
          detail: item.schedule,
          iconColor: item.id.endsWith("1") ? "#D4F4E4" : "#CDCFFC",
        }))}
        emptyMessage="No medications stored yet."
      />

      <Card mode="outlined" style={styles.feedbackCard}>
        <Card.Content style={styles.timelineContent}>
          <Text variant="titleMedium" style={styles.feedbackTitle}>
            Medication routine
          </Text>
          <Text variant="bodyMedium" style={styles.feedbackBody}>
            A timeline grouped from the medication schedule text already stored
            in memory.
          </Text>

          {medicationTimeline.length > 0 ? (
            medicationTimeline.map((item, index) => (
              <View key={item.id} style={styles.timelineRow}>
                <View style={styles.timelineRail}>
                  <View style={styles.timelineDot} />
                  {index < medicationTimeline.length - 1 ? (
                    <View style={styles.timelineLine} />
                  ) : null}
                </View>
                <View style={styles.timelineItemCard}>
                  <Text variant="bodySmall" style={styles.timelineLabel}>
                    {item.period}
                  </Text>
                  <Text variant="titleSmall" style={styles.timelineTitle}>
                    {item.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.timelineMeta}>
                    {item.schedule}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text variant="bodyMedium" style={styles.feedbackBody}>
              No medication routine has been stored yet.
            </Text>
          )}
        </Card.Content>
      </Card>

      <MemorySectionCard
        title="Important contacts"
        iconName="call"
        accentColor="#1D9E75"
        rows={(memoryRecord?.contacts ?? []).map((item) => ({
          id: item.id,
          label: item.name,
          detail: `${item.role} | ${item.phone}`,
        }))}
        emptyMessage="No important contacts stored yet."
      />

      <MemorySectionCard
        title="Preferences"
        iconName="heart"
        accentColor="#D29B2F"
        rows={(memoryRecord?.preferences ?? []).map((item) => ({
          id: item.id,
          label: item.label,
          detail: item.value,
        }))}
        emptyMessage="No preferences stored yet."
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    gap: 0,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: "#A1A1AA",
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 8,
  },
  statusBlock: {
    marginBottom: 18,
  },
  statusLabel: {
    color: "#7C7C87",
    letterSpacing: 0.3,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  statusValue: {
    color: "#E4E4E7",
  },
  feedbackCard: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 18,
    marginBottom: 18,
  },
  feedbackContent: {
    gap: 14,
  },
  timelineContent: {
    gap: 14,
  },
  feedbackText: {
    gap: 6,
  },
  feedbackTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  feedbackBody: {
    color: "#A1A1AA",
    lineHeight: 20,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 12,
  },
  timelineRail: {
    alignItems: "center",
    width: 14,
  },
  timelineDot: {
    backgroundColor: "#8B8DF1",
    borderRadius: 99,
    height: 10,
    marginTop: 4,
    width: 10,
  },
  timelineLine: {
    backgroundColor: "#2D2D2D",
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  timelineItemCard: {
    backgroundColor: "#171717",
    borderColor: "#2D2D2D",
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    padding: 14,
  },
  timelineLabel: {
    color: "#D4F4E4",
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  timelineTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  timelineMeta: {
    color: "#A1A1AA",
    lineHeight: 18,
  },
});
