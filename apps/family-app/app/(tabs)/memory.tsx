import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button, Card, Modal, Portal, Text } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

import { ScreenShell } from "@/components/screen-shell";
import { useAuth } from "@/context/auth-context";
import { getCurrentUserMemory, memoryApiBaseUrl } from "@/lib/memory-api";
import type { UserMemoryRecord } from "@/types/memory";

const memoryAccentPalette = ["#CDCFFC", "#D4F4E4", "#F9E4D4", "#F6E7B2"];

function splitMemoryNote(note: string) {
  const trimmed = note.trim();
  const separatorIndex = trimmed.indexOf(":");

  if (separatorIndex <= 0) {
    return {
      label: "Memory",
      value: trimmed,
    };
  }

  return {
    label: trimmed.slice(0, separatorIndex).trim(),
    value: trimmed.slice(separatorIndex + 1).trim(),
  };
}

export default function MemoryScreen() {
  const { user } = useAuth();
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedMemory, setSelectedMemory] = useState<string | null>(null);

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

  const screenTitle = memoryRecord?.name
    ? `${memoryRecord.name}'s profile`
    : "Memory profile";
  const memoryNotes = memoryRecord?.memories ?? [];

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
              Fetching memory notes from {memoryApiBaseUrl}.
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

      <Card mode="outlined" style={styles.notesCard}>
        <Card.Content style={styles.notesContent}>
          <View style={styles.notesHeader}>
            <View style={styles.notesHeaderCopy}>
              <Text variant="titleMedium" style={styles.notesTitle}>
                Memory notes
              </Text>
              <Text variant="bodyMedium" style={styles.notesSubtitle}>
                Saved details the assistant can use to stay personal and helpful.
              </Text>
            </View>
            <View style={styles.notesBadge}>
              <Ionicons name="albums-outline" size={16} color="#23244D" />
              <Text variant="bodySmall" style={styles.notesBadgeText}>
                {memoryNotes.length} notes
              </Text>
            </View>
          </View>

          {memoryNotes.length > 0 ? (
            <>
              <View style={styles.summaryRow}>
                <View style={styles.summaryCard}>
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Total
                  </Text>
                  <Text variant="headlineSmall" style={styles.summaryValue}>
                    {memoryNotes.length}
                  </Text>
                </View>
                <Pressable
                  onPress={() => setSelectedMemory(memoryNotes[0] ?? null)}
                  style={({ pressed }) => [
                    styles.summaryCard,
                    styles.summaryCardInteractive,
                    pressed ? styles.summaryCardPressed : null,
                  ]}
                >
                  <Text variant="bodySmall" style={styles.summaryLabel}>
                    Latest
                  </Text>
                  <Text
                    variant="bodyMedium"
                    style={styles.summaryText}
                    numberOfLines={2}
                  >
                    {memoryNotes[0]}
                  </Text>
                  <Text variant="bodySmall" style={styles.summaryHint}>
                    Tap to read full note
                  </Text>
                </Pressable>
              </View>

              <View style={styles.noteList}>
                {memoryNotes.map((item, index) => {
                  const note = splitMemoryNote(item);
                  const accentColor =
                    memoryAccentPalette[index % memoryAccentPalette.length];

                  return (
                    <View
                      key={`${memoryRecord?._id ?? "memory"}-note-${index + 1}`}
                      style={styles.noteCard}
                    >
                      <View style={styles.noteCardTop}>
                        <View
                          style={[
                            styles.noteAccent,
                            { backgroundColor: accentColor },
                          ]}
                        />
                        <Text variant="bodySmall" style={styles.noteIndex}>
                          Note {index + 1}
                        </Text>
                      </View>
                      <Text variant="bodySmall" style={styles.noteLabel}>
                        {note.label}
                      </Text>
                      <Text variant="bodyLarge" style={styles.noteValue}>
                        {note.value}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons name="albums-outline" size={22} color="#4D4FA0" />
              </View>
              <Text variant="titleMedium" style={styles.feedbackTitle}>
                No memory notes stored yet
              </Text>
              <Text variant="bodyMedium" style={styles.feedbackBody}>
                Saved notes will show up here once the assistant learns something meaningful.
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      <Portal>
        <Modal
          visible={selectedMemory !== null}
          onDismiss={() => setSelectedMemory(null)}
          contentContainerStyle={styles.memoryModal}
        >
          <View style={styles.memoryModalHeader}>
            <View style={styles.memoryModalTitleRow}>
              <View style={styles.memoryModalIcon}>
                <Ionicons name="book-outline" size={20} color="#23244D" />
              </View>
              <View style={styles.memoryModalCopy}>
                <Text variant="titleMedium" style={styles.memoryModalTitle}>
                  Latest memory
                </Text>
                <Text variant="bodySmall" style={styles.memoryModalSubtitle}>
                  Full note
                </Text>
              </View>
            </View>
            <Button compact mode="text" textColor="#8B8DF1" onPress={() => setSelectedMemory(null)}>
              Close
            </Button>
          </View>

          <Text variant="bodyLarge" style={styles.memoryModalBody}>
            {selectedMemory ?? ""}
          </Text>
        </Modal>
      </Portal>
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
  notesCard: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 22,
    marginBottom: 18,
  },
  notesContent: {
    gap: 18,
  },
  notesHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  notesHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  notesTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  notesSubtitle: {
    color: "#A1A1AA",
    lineHeight: 20,
    maxWidth: 260,
  },
  notesBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#CDCFFC",
    borderRadius: 999,
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  notesBadgeText: {
    color: "#23244D",
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    gap: 12,
  },
  summaryCard: {
    backgroundColor: "#171717",
    borderColor: "#2D2D2D",
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minHeight: 96,
    padding: 16,
  },
  summaryCardInteractive: {
    justifyContent: "space-between",
  },
  summaryCardPressed: {
    opacity: 0.88,
  },
  summaryLabel: {
    color: "#8A8A96",
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  summaryText: {
    color: "#E4E4E7",
    lineHeight: 20,
  },
  summaryHint: {
    color: "#8B8DF1",
    fontWeight: "600",
    marginTop: 4,
  },
  noteList: {
    gap: 12,
  },
  noteCard: {
    backgroundColor: "#171717",
    borderColor: "#2D2D2D",
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  noteCardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteAccent: {
    borderRadius: 999,
    height: 12,
    width: 44,
  },
  noteIndex: {
    color: "#8A8A96",
    fontWeight: "700",
  },
  noteLabel: {
    color: "#A1A1AA",
    fontWeight: "700",
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  noteValue: {
    color: "#FFFFFF",
    fontWeight: "600",
    lineHeight: 22,
  },
  emptyState: {
    alignItems: "center",
    backgroundColor: "#171717",
    borderColor: "#2D2D2D",
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyStateIcon: {
    alignItems: "center",
    backgroundColor: "#23244D",
    borderRadius: 999,
    height: 46,
    justifyContent: "center",
    marginBottom: 4,
    width: 46,
  },
  memoryModal: {
    backgroundColor: "#1E1E1E",
    borderColor: "#303038",
    borderRadius: 24,
    borderWidth: 1,
    gap: 18,
    margin: 20,
    padding: 20,
  },
  memoryModalHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  memoryModalTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  memoryModalIcon: {
    alignItems: "center",
    backgroundColor: "#CDCFFC",
    borderRadius: 14,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  memoryModalCopy: {
    flex: 1,
  },
  memoryModalTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  memoryModalSubtitle: {
    color: "#8A8A96",
    marginTop: 2,
  },
  memoryModalBody: {
    color: "#E4E4E7",
    lineHeight: 24,
  },
});
