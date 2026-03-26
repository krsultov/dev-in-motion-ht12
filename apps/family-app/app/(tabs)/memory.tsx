import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { MemorySectionCard } from '@/components/memory-section-card';
import { ScreenShell } from '@/components/screen-shell';
import { memoryData } from '@/data/dummy';

export default function MemoryScreen() {
  // This screen renders Maria's stored medications, key contacts, and personal preferences.
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
        rows={memoryData.medications.map((item) => ({
          id: item.id,
          label: item.name,
          detail: item.schedule,
          iconColor: item.id === '1' ? '#D4F4E4' : '#CDCFFC',
        }))}
      />

      <MemorySectionCard
        title="Important contacts"
        iconName="call"
        accentColor="#1D9E75"
        rows={memoryData.contacts.map((item) => ({
          id: item.id,
          label: item.name,
          detail: `${item.role} | ${item.phone}`,
        }))}
      />

      <MemorySectionCard
        title="Preferences"
        iconName="heart"
        accentColor="#D29B2F"
        rows={memoryData.preferences.map((item) => ({
          id: item.id,
          label: item.label,
          detail: item.value,
        }))}
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
});
