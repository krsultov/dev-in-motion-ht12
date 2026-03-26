import { ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { MemorySectionCard } from '@/components/memory-section-card';
import { memoryData } from '@/data/dummy';

export default function MemoryScreen() {
  // This screen renders Maria's stored medications, key contacts, and personal preferences.
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Maria&apos;s profile
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Reference details the assistant can use while helping her.
      </Text>

      <MemorySectionCard
        title="Medications"
        iconName="medical"
        accentColor="#2563EB"
        rows={memoryData.medications.map((item) => ({
          id: item.id,
          label: item.name,
          detail: item.schedule,
        }))}
      />

      <MemorySectionCard
        title="Important contacts"
        iconName="call"
        accentColor="#0F766E"
        rows={memoryData.contacts.map((item) => ({
          id: item.id,
          label: item.name,
          detail: `${item.role} · ${item.phone}`,
        }))}
      />

      <MemorySectionCard
        title="Preferences"
        iconName="heart"
        accentColor="#CA8A04"
        rows={memoryData.preferences.map((item) => ({
          id: item.id,
          label: item.label,
          detail: item.value,
        }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    color: '#475569',
    marginBottom: 20,
    marginTop: 6,
  },
});
