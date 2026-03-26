import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { MemorySectionCard } from '@/components/memory-section-card';
import { ScreenShell } from '@/components/screen-shell';
import { useMemory } from '@/hooks/useMemory';

function renderSectionContent(
  isLoading: boolean,
  isError: boolean,
  emptyMessage: string,
) {
  if (isLoading) {
    return (
      <View style={styles.feedbackRow}>
        <ActivityIndicator size="small" color="#8B8DF1" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.feedbackRow}>
        <Text variant="bodySmall" style={styles.feedbackText}>
          Could not load data
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.feedbackRow}>
      <Text variant="bodySmall" style={styles.feedbackText}>
        {emptyMessage}
      </Text>
    </View>
  );
}

export default function MemoryScreen() {
  // This screen renders Maria's stored medications, key contacts, and personal preferences.
  const { data, isLoading, isError } = useMemory();

  return (
    <ScreenShell>
      <Text variant="headlineSmall" style={styles.title}>
        Maria&apos;s profile
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        What the AI knows about her.
      </Text>

      <MemorySectionCard
        title="Medications"
        iconName="medical"
        accentColor="#534AB7"
        rows={
          data?.medications.map((item) => ({
            id: item.id,
            label: item.name,
            detail: item.schedule,
            iconColor: item.id === '1' ? '#D4F4E4' : '#CDCFFC',
          })) ?? []
        }
        content={
          !data?.medications.length
            ? renderSectionContent(isLoading, isError, 'No medications recorded yet')
            : undefined
        }
      />

      <MemorySectionCard
        title="Important contacts"
        iconName="call"
        accentColor="#1D9E75"
        rows={
          data?.contacts.map((item) => ({
            id: item.id,
            label: item.name,
            detail: `${item.role} | ${item.phone}`,
          })) ?? []
        }
        content={
          !data?.contacts.length
            ? renderSectionContent(isLoading, isError, 'No contacts recorded yet')
            : undefined
        }
      />

      <MemorySectionCard
        title="Preferences"
        iconName="heart"
        accentColor="#D29B2F"
        rows={
          data?.preferences.map((item) => ({
            id: item.id,
            label: item.label,
            detail: item.value,
          })) ?? []
        }
        content={
          !data?.preferences.length
            ? renderSectionContent(isLoading, isError, 'No preferences recorded yet')
            : undefined
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  subtitle: {
    color: '#A1A1AA',
    marginBottom: 20,
    marginTop: 6,
  },
  feedbackRow: {
    paddingBottom: 4,
    paddingTop: 4,
  },
  feedbackText: {
    color: '#A1A1AA',
    lineHeight: 18,
  },
});
