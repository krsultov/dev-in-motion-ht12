import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Text } from 'react-native-paper';

import { MemorySectionCard } from '@/components/memory-section-card';
import { ScreenShell } from '@/components/screen-shell';
import { useAuth } from '@/context/auth-context';
import {
  getCurrentUserMemory,
  getLatestUserMemoryRecord,
  memoryApiBaseUrl,
} from '@/lib/memory-api';
import type { UserMemoryRecord } from '@/types/memory';

export default function MemoryScreen() {
  const { user } = useAuth();
  const userPhone = user?.phone ?? null;
  const [memoryRecord, setMemoryRecord] = useState<UserMemoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resolvedPhone, setResolvedPhone] = useState<string | null>(userPhone);

  const loadMemory = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial', options?: { signal?: { aborted: boolean } }) => {
      if (mode !== 'refresh') {
        setIsLoading(true);
      }

      try {
        console.log('[memory-screen] loadMemory:start', { mode, user });
        const fallbackRecord = !userPhone ? await getLatestUserMemoryRecord() : null;
        const activePhone = userPhone?.trim() || fallbackRecord?.phone?.trim() || '';
        const record = activePhone ? await getCurrentUserMemory(activePhone) : fallbackRecord;

        if (options?.signal?.aborted) {
          return;
        }

        console.log('[memory-screen] loadMemory:resolved', {
          activePhone,
          fallbackRecord,
          record,
        });

        setResolvedPhone(activePhone || null);
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
            : 'Unable to load memory data right now.',
        );
        console.log('[memory-screen] loadMemory:failed', { error });
      } finally {
        if (!options?.signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [user, userPhone],
  );

  useEffect(() => {
    const request = { aborted: false };
    void loadMemory('initial', { signal: request });

    return () => {
      request.aborted = true;
    };
  }, [loadMemory]);

  useEffect(() => {
    console.log('[memory-screen] render state', {
      errorMessage,
      isLoading,
      memoryRecord,
      resolvedPhone,
    });
  }, [errorMessage, isLoading, memoryRecord, resolvedPhone]);

  const screenTitle = memoryRecord?.name
    ? `${memoryRecord.name}'s profile`
    : 'Memory profile';

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
          {resolvedPhone ?? user?.phone ?? 'Not available'}
        </Text>
      </View>

      {isLoading ? (
        <Card mode="outlined" style={styles.feedbackCard}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.feedbackTitle}>
              Loading memory
            </Text>
            <Text variant="bodyMedium" style={styles.feedbackBody}>
              Fetching medications, contacts, and preferences from {memoryApiBaseUrl}.
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
            <Button mode="contained" buttonColor="#8B8DF1" textColor="#18181B" onPress={() => void loadMemory()}>
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
          id: `${memoryRecord?._id ?? 'memory'}-note-${index + 1}`,
          label: `Memory ${index + 1}`,
          detail: item,
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
          iconColor: item.id.endsWith('1') ? '#D4F4E4' : '#CDCFFC',
        }))}
        emptyMessage="No medications stored yet."
      />

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
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    color: '#A1A1AA',
    lineHeight: 21,
    marginBottom: 24,
    marginTop: 8,
  },
  statusBlock: {
    marginBottom: 18,
  },
  statusLabel: {
    color: '#7C7C87',
    letterSpacing: 0.3,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#E4E4E7',
  },
  feedbackCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#303038',
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
    color: '#FFFFFF',
    fontWeight: '700',
  },
  feedbackBody: {
    color: '#A1A1AA',
    lineHeight: 20,
  },
});
